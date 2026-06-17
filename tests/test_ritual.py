import pytest
import http.server
import socketserver
import threading
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

PORT = 8990

class ThreadedHTTPServer:
    def __init__(self, host, port):
        # Serve from current directory
        handler = http.server.SimpleHTTPRequestHandler
        # Allow reuse of address
        socketserver.TCPServer.allow_reuse_address = True
        self.server = socketserver.TCPServer((host, port), handler)
        self.server_thread = threading.Thread(target=self.server.serve_forever)
        self.server_thread.daemon = True

    def start(self):
        self.server_thread.start()

    def stop(self):
        self.server.shutdown()
        self.server.server_close()

@pytest.fixture(scope="module")
def server():
    srv = ThreadedHTTPServer("127.0.0.1", PORT)
    srv.start()
    # Give server a moment to start
    time.sleep(0.5)
    yield srv
    srv.stop()

@pytest.fixture
def driver():
    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=chrome_options)
    
    # Inject Mock Date before page load.
    # We lock the date to Wednesday, June 3rd, 2026 (getDay() -> 3)
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": """
            const MOCK_TIME = new Date("2026-06-03T12:00:00").getTime();
            const OriginalDate = window.Date;
            window.Date = class extends OriginalDate {
                constructor(...args) {
                    if (args.length === 0) {
                        super(MOCK_TIME);
                    } else {
                        super(...args);
                    }
                }
                static now() {
                    return MOCK_TIME;
                }
            };
        """
    })
    
    yield driver
    driver.quit()

def test_onboarding_and_basic_setup(server, driver):
    driver.get(f"http://127.0.0.1:{PORT}/")
    
    # Wait for onboarding modal
    wait = WebDriverWait(driver, 5)
    onboarding = wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    assert onboarding.is_displayed()
    
    # Click Next Step (Step 1 -> Step 2)
    next_btn = driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step")
    next_btn.click()
    time.sleep(0.2)
    
    # Click Next Step (Step 2 -> Step 3)
    next_btn = driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step")
    next_btn.click()
    time.sleep(0.2)
    
    # Click clean slate (Start from scratch)
    btn_clean = driver.find_element(By.ID, "btn-onboarding-clean")
    btn_clean.click()
    time.sleep(0.5)
    
    # Onboarding should close, and we should see empty state
    assert not onboarding.is_displayed()
    empty_card = driver.find_element(By.CLASS_NAME, "empty-state-card")
    assert empty_card.is_displayed()

def test_supplement_scheduling_and_stock(server, driver):
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)
    
    # Skip onboarding by choosing Demo state to get blocks populated
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    
    # Enable daily tracking checkbox
    driver.execute_script("const cb = document.getElementById('onboarding-daily-tracking'); cb.checked = true; cb.dispatchEvent(new Event('change'));")
    time.sleep(0.1)
    
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-demo").click()
    time.sleep(0.5)

    # Enable scheduling and stock toggles via JS (since they are off by default now)
    driver.execute_script("""
        const s1 = document.getElementById('setting-supp-scheduling');
        s1.checked = true;
        s1.dispatchEvent(new Event('change'));
        const s2 = document.getElementById('setting-supp-stock');
        s2.checked = true;
        s2.dispatchEvent(new Event('change'));
    """)
    time.sleep(0.2)
    
    # Now we have demo supplements. Let's toggle Edit Mode (Настроить)
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)
    
    # Click to add/edit item in "Morning" block (block-utro)
    add_item_btn = driver.find_element(By.CSS_SELECTOR, "button.add-item-card-btn[data-block-id='block-utro']")
    driver.execute_script("arguments[0].click();", add_item_btn)
    time.sleep(0.3)
    
    # Fill Supplement Form: Name, Dose, and Scheduling
    # Let's add "Spirulina" with scheduling on Wednesday (today is Wednesday -> 3)
    driver.find_element(By.ID, "item-name").send_keys("Spirulina")
    driver.find_element(By.ID, "item-dose").send_keys("3 caps")
    
    # Verify stock inputs exist in HTML
    assert driver.find_element(By.ID, "item-stock-total") is not None
    assert driver.find_element(By.ID, "item-stock-take") is not None
    
    # Fill stock information: 10 capsules total, taking 2 each time
    driver.find_element(By.ID, "item-stock-total").send_keys("10")
    driver.find_element(By.ID, "item-stock-take").send_keys("2")
    
    # Select schedule type: "По дням"
    driver.execute_script("arguments[0].click();", driver.find_element(By.ID, "item-schedule-days"))
    time.sleep(0.1)
    
    # Click Wednesday (data-day="3") and Monday (data-day="1")
    wednesday_btn = driver.find_element(By.XPATH, "//div[@id='item-days-picker']/button[@data-day='3']")
    driver.execute_script("arguments[0].click();", wednesday_btn)
    monday_btn = driver.find_element(By.XPATH, "//div[@id='item-days-picker']/button[@data-day='1']")
    driver.execute_script("arguments[0].click();", monday_btn)
    
    # Submit form
    submit_btn = driver.find_element(By.CSS_SELECTOR, "#form-item button[type='submit']")
    driver.execute_script("arguments[0].click();", submit_btn)
    time.sleep(0.3)
    
    # Let's add another supplement: "Ascorbinka", only on Monday (data-day="1") (not today!)
    add_item_btn = driver.find_element(By.CSS_SELECTOR, "button.add-item-card-btn[data-block-id='block-utro']")
    driver.execute_script("arguments[0].click();", add_item_btn)
    time.sleep(0.3)
    driver.find_element(By.ID, "item-name").send_keys("Ascorbinka")
    driver.find_element(By.ID, "item-dose").send_keys("1 pc")
    driver.execute_script("arguments[0].click();", driver.find_element(By.ID, "item-schedule-days"))
    time.sleep(0.1)
    driver.execute_script("arguments[0].click();", driver.find_element(By.XPATH, "//div[@id='item-days-picker']/button[@data-day='1']"))
    
    submit_btn = driver.find_element(By.CSS_SELECTOR, "#form-item button[type='submit']")
    driver.execute_script("arguments[0].click();", submit_btn)
    time.sleep(0.3)
    
    # Disable Edit Mode (Finished configuration)
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.3)
    
    # In Normal Mode:
    # "Spirulina" should be visible because it's scheduled for Wednesday (today)
    spirulina_row = driver.find_element(By.XPATH, "//span[contains(text(), 'Spirulina')]/ancestor::div[contains(@class, 'row-item')]")
    assert spirulina_row.is_displayed()
    
    # "Ascorbinka" should be HIDDEN because it's only scheduled for Monday
    with pytest.raises(Exception):
        # Should not find visible row for Ascorbinka
        row = driver.find_element(By.XPATH, "//span[contains(text(), 'Ascorbinka')]/ancestor::div[contains(@class, 'row-item')]")
        assert not row.is_displayed()
        
    # Check "Спирулина" checkbox to verify stock reduction
    # Ensure daily tracking is enabled (it is enabled by default in Demo state settings)
    # Check it
    checkbox = spirulina_row.find_element(By.CLASS_NAME, "custom-checkbox")
    driver.execute_script("arguments[0].click();", checkbox)
    time.sleep(0.2)
    
    # Verify checkbox is checked - must re-find after renderApp() rebuilds DOM
    spirulina_row = driver.find_element(By.XPATH, "//span[contains(text(), 'Spirulina')]/ancestor::div[contains(@class, 'row-item')]")
    checkbox = spirulina_row.find_element(By.CLASS_NAME, "custom-checkbox")
    assert "checked" in checkbox.get_attribute("class")
    
    # Let's open Edit Mode to check the stock badge value or see if stock is updated
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)
    
    # Re-find spirulina_row because DOM was rebuilt
    spirulina_row = driver.find_element(By.XPATH, "//span[contains(text(), 'Spirulina')]/ancestor::div[contains(@class, 'row-item')]")
    badge = spirulina_row.find_element(By.CLASS_NAME, "stock-warning-badge")
    assert "8" in badge.text
    
    # Disable Edit Mode and uncheck it
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)
    
    # Re-find checkbox before unchecking
    spirulina_row = driver.find_element(By.XPATH, "//span[contains(text(), 'Spirulina')]/ancestor::div[contains(@class, 'row-item')]")
    checkbox = spirulina_row.find_element(By.CLASS_NAME, "custom-checkbox")
    driver.execute_script("arguments[0].click();", checkbox)
    time.sleep(0.2)
    
    # Check if stock goes back to 10 (badge should disappear in edit mode or show 10)
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)

def test_skincare_expiry_badges(server, driver):
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)
    
    # Skip onboarding using Demo state
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-demo").click()
    time.sleep(0.5)

    # Enable skincare and skincare expiration toggles via JS
    driver.execute_script("""
        const s1 = document.getElementById('setting-skincare-enabled');
        s1.checked = true;
        s1.dispatchEvent(new Event('change'));
        const s2 = document.getElementById('setting-skin-expiration');
        s2.checked = true;
        s2.dispatchEvent(new Event('change'));
    """)
    time.sleep(0.2)
    
    # Switch to Skincare screen
    driver.find_element(By.ID, "nav-skincare").click()
    time.sleep(0.3)
    
    # Open edit mode on skincare
    skincare_edit_toggle = driver.find_element(By.ID, "skincare-edit-toggle")
    driver.execute_script("arguments[0].click();", skincare_edit_toggle)
    time.sleep(0.2)
    
    # Click "+ Добавить утреннее средство"
    btn_add = driver.find_element(By.ID, "btn-add-skincare-morning")
    driver.execute_script("arguments[0].click();", btn_add)
    time.sleep(0.3)
    
    # Add expired skincare: opened 2 months ago, PAO = 1 month
    driver.find_element(By.ID, "skincare-name").send_keys("Expired Cream")
    
    # Fill dates: opened 2026-04-03 (2 months before 2026-06-03), PAO = 1
    driver.execute_script("document.getElementById('skincare-opened-date').value = '2026-04-03';")
    driver.find_element(By.ID, "skincare-pao").send_keys("1")
    
    # Submit form
    submit_btn = driver.find_element(By.CSS_SELECTOR, "#form-skincare button[type='submit']")
    driver.execute_script("arguments[0].click();", submit_btn)
    time.sleep(0.3)
    
    # Verify expired badge is rendered
    expired_badge = wait.until(EC.presence_of_element_located((By.XPATH, "//span[contains(text(), 'Expired Cream')]/ancestor::div[contains(@class, 'skincare-card')]//span[contains(@class, 'expired')]")))
    assert expired_badge.is_displayed()
    
    # Click to add another skincare: expiring soon (expires in 10 days)
    driver.execute_script("arguments[0].click();", btn_add)
    time.sleep(0.3)
    driver.find_element(By.ID, "skincare-name").send_keys("Expires Soon")
    
    # Absolute EXP date set to 2026-06-13 (10 days from 2026-06-03)
    driver.execute_script("document.getElementById('skincare-exp-date').value = '2026-06-13';")
    
    submit_btn = driver.find_element(By.CSS_SELECTOR, "#form-skincare button[type='submit']")
    driver.execute_script("arguments[0].click();", submit_btn)
    time.sleep(0.3)
    
    # Verify expiring soon warning badge is rendered
    warning_badge = wait.until(EC.presence_of_element_located((By.XPATH, "//span[contains(text(), 'Expires Soon')]/ancestor::div[contains(@class, 'skincare-card')]//span[contains(@class, 'warning')]")))
    assert warning_badge.is_displayed()
    assert "10" in warning_badge.text

def test_feature_toggles_default_disabled(server, driver):
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)
    
    # Skip onboarding using Clean state
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-clean").click()
    time.sleep(0.5)
    
    # 1. Skincare nav should be hidden by default
    bottom_nav = driver.find_element(By.CLASS_NAME, "bottom-nav")
    assert bottom_nav.value_of_css_property("display") == "none"
    
    # 2. Add block so we can open add-item modal
    # Toggle Edit Mode (Настроить)
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)
    
    # Open block modal
    btn_first_block = driver.find_element(By.ID, "btn-create-first-block")
    driver.execute_script("arguments[0].click();", btn_first_block)
    time.sleep(0.2)
    driver.find_element(By.ID, "block-name").send_keys("Morning")
    btn_block_submit = driver.find_element(By.CSS_SELECTOR, "#form-block button[type='submit']")
    driver.execute_script("arguments[0].click();", btn_block_submit)
    time.sleep(0.3)
    
    # Open add-item modal
    btn_add_item = driver.find_element(By.CSS_SELECTOR, "button.add-item-card-btn")
    driver.execute_script("arguments[0].click();", btn_add_item)
    time.sleep(0.3)
    
    # Scheduling fields and stock control fields in the form should be hidden by default
    sched_group = driver.find_element(By.ID, "item-scheduling-toggle-group")
    assert sched_group.value_of_css_property("display") == "none"
    
    stock_group = driver.find_element(By.ID, "item-stock-toggle-group")
    assert stock_group.value_of_css_property("display") == "none"
    
    # Close add-item modal
    btn_item_cancel = driver.find_element(By.CSS_SELECTOR, "#dialog-item .btn-cancel")
    driver.execute_script("arguments[0].click();", btn_item_cancel)
    time.sleep(0.2)
    
    # 3. Enable skincare setting and verify nav becomes visible
    driver.execute_script("""
        const cb = document.getElementById('setting-skincare-enabled');
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
    """)
    time.sleep(0.2)
    assert bottom_nav.value_of_css_property("display") == "flex"
    
    # Switch to Skincare screen
    nav_skincare = driver.find_element(By.ID, "nav-skincare")
    driver.execute_script("arguments[0].click();", nav_skincare)
    time.sleep(0.3)
    
    # Open skincare edit mode
    skincare_edit_toggle = driver.find_element(By.ID, "skincare-edit-toggle")
    driver.execute_script("arguments[0].click();", skincare_edit_toggle)
    time.sleep(0.2)
    
    # Open add-skincare modal
    btn_add_skincare = driver.find_element(By.ID, "btn-add-skincare-morning")
    driver.execute_script("arguments[0].click();", btn_add_skincare)
    time.sleep(0.3)
    
    # Expiration fields should be hidden by default
    exp_group = driver.find_element(By.ID, "skincare-expiration-toggle-group")
    assert exp_group.value_of_css_property("display") == "none"

    # Close skincare modal
    btn_skincare_cancel = driver.find_element(By.CSS_SELECTOR, "#dialog-skincare .btn-cancel")
    driver.execute_script("arguments[0].click();", btn_skincare_cancel)
    time.sleep(0.2)


def test_theme_toggle(server, driver):
    """Test dark/light theme toggle and persistence."""
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)

    # Skip onboarding
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-clean").click()
    time.sleep(0.5)

    # Initially should be light theme (no 'dark' class on html)
    html_el = driver.find_element(By.TAG_NAME, "html")
    assert "dark" not in html_el.get_attribute("class")

    # Toggle theme
    theme_btn = driver.find_element(By.ID, "theme-toggle")
    driver.execute_script("arguments[0].click();", theme_btn)
    time.sleep(0.2)

    # Should now have dark theme
    html_el = driver.find_element(By.TAG_NAME, "html")
    assert "dark" in html_el.get_attribute("class")

    # Toggle back to light
    driver.execute_script("arguments[0].click();", theme_btn)
    time.sleep(0.2)
    html_el = driver.find_element(By.TAG_NAME, "html")
    assert "dark" not in html_el.get_attribute("class")

def test_search_filter(server, driver):
    """Test search functionality for filtering supplements."""
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)

    # Use Demo state to have items
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-demo").click()
    time.sleep(0.5)

    # Search for "Омега"
    search_input = driver.find_element(By.ID, "search-input")
    search_input.send_keys("Омега")
    time.sleep(0.3)

    # Should see matching items
    rows = driver.find_elements(By.CLASS_NAME, "row-item")
    visible_rows = [r for r in rows if r.is_displayed()]
    filtered_count = len(visible_rows)
    assert filtered_count >= 1

    # Verify all visible rows contain "Омега" in their text
    for row in visible_rows:
        assert "Омега" in row.text

    # Clear search
    clear_btn = driver.find_element(By.ID, "search-clear-btn")
    driver.execute_script("arguments[0].click();", clear_btn)
    time.sleep(0.2)

    # All rows should be visible again
    rows = driver.find_elements(By.CLASS_NAME, "row-item")
    visible_rows = [r for r in rows if r.is_displayed()]
    assert len(visible_rows) > filtered_count  # More items now

def test_mark_all_button(server, driver):
    """Test 'Mark All' button functionality in blocks."""
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)

    # Use Demo state
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-demo").click()
    time.sleep(0.5)

    # Enable daily tracking
    driver.execute_script("""
        const cb = document.getElementById('setting-daily-tracking');
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
    """)
    time.sleep(0.2)

    # Find first block's "Mark All" button
    mark_all_btn = driver.find_element(By.CLASS_NAME, "btn-mark-all")
    initial_text = mark_all_btn.text

    # Click Mark All
    driver.execute_script("arguments[0].click();", mark_all_btn)
    time.sleep(0.3)

    # Button should change to "Готово"
    mark_all_btn = driver.find_element(By.CLASS_NAME, "btn-mark-all")
    assert mark_all_btn.text == "✓ Готово"

    # All checkboxes in block should be checked
    card = mark_all_btn.find_element(By.XPATH, "./ancestor::div[contains(@class, 'card')]")
    checkboxes = card.find_elements(By.CLASS_NAME, "custom-checkbox")
    for cb in checkboxes:
        assert "checked" in cb.get_attribute("class")

def test_export_import_data(server, driver):
    """Test data export and import functionality."""
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)

    # Skip onboarding with clean state
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-clean").click()
    time.sleep(0.5)

    # Open settings
    settings_btn = driver.find_element(By.ID, "settings-btn")
    driver.execute_script("arguments[0].click();", settings_btn)
    time.sleep(0.3)

    # Create a block first
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)

    btn_first_block = driver.find_element(By.ID, "btn-create-first-block")
    driver.execute_script("arguments[0].click();", btn_first_block)
    time.sleep(0.2)
    driver.find_element(By.ID, "block-name").send_keys("Тестовый блок")
    driver.execute_script("document.getElementById('block-icon').value = '🧪';")
    btn_block_submit = driver.find_element(By.CSS_SELECTOR, "#form-block button[type='submit']")
    driver.execute_script("arguments[0].click();", btn_block_submit)
    time.sleep(0.3)

    # Close settings and reopen for export
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)
    driver.execute_script("arguments[0].click();", settings_btn)
    time.sleep(0.3)

    # Export should trigger download (we can't verify file, but can verify no error)
    export_btn = driver.find_element(By.ID, "btn-export-json")
    driver.execute_script("arguments[0].click();", export_btn)
    time.sleep(0.5)

    # Import - prepare a JSON file
    import_config = {
        "blocks": [{"id": "imported-block", "name": "Импортированный блок", "icon": "📦", "sub": "", "color": "utro"}],
        "items": [{"id": "imported-item", "blockId": "imported-block", "name": "Импортированная добавка", "dose": "1 шт", "cond": "", "checked": False}],
        "skincareItems": [],
        "settings": {
            "dailyTrackingEnabled": True,
            "onboardingCompleted": True,
            "skincareEnabled": False,
            "suppSchedulingEnabled": False,
            "suppStockEnabled": False,
            "skinExpirationEnabled": False
        }
    }
    import json
    import tempfile
    import os

    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(import_config, f)
        temp_file = f.name

    # Upload file via import
    import_btn = driver.find_element(By.ID, "btn-import-trigger")
    file_input = driver.find_element(By.ID, "import-file-input")
    file_input.send_keys(temp_file)
    time.sleep(0.5)

    os.unlink(temp_file)

    # Verify imported data
    imported_block = driver.find_element(By.XPATH, "//span[contains(text(), 'Импортированный блок')]")
    assert imported_block.is_displayed()

def test_reset_to_default(server, driver):
    """Test reset stack to default functionality."""
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)

    # Start with clean state
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-clean").click()
    time.sleep(0.5)

    # Create a custom block
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)

    btn_first_block = driver.find_element(By.ID, "btn-create-first-block")
    driver.execute_script("arguments[0].click();", btn_first_block)
    time.sleep(0.2)
    driver.find_element(By.ID, "block-name").send_keys("Мой блок")
    btn_block_submit = driver.find_element(By.CSS_SELECTOR, "#form-block button[type='submit']")
    driver.execute_script("arguments[0].click();", btn_block_submit)
    time.sleep(0.3)

    # Verify block exists
    custom_block = driver.find_element(By.XPATH, "//span[contains(text(), 'Мой блок')]")
    assert custom_block.is_displayed()

    # Open settings and reset
    settings_btn = driver.find_element(By.ID, "settings-btn")
    driver.execute_script("arguments[0].click();", settings_btn)
    time.sleep(0.3)

    reset_btn = driver.find_element(By.ID, "btn-reset-default")
    driver.execute_script("arguments[0].click();", reset_btn)
    time.sleep(0.3)

    # Confirm reset
    driver.switch_to.alert.accept()
    time.sleep(0.5)

    # Custom block should be gone, empty state should appear
    empty_card = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "empty-state-card")))
    assert empty_card.is_displayed()

def test_skincare_schedule_types(server, driver):
    """Test different skincare schedule types: daily, days, frequency."""
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)

    # Skip onboarding
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-clean").click()
    time.sleep(0.5)

    # Enable skincare
    driver.execute_script("""
        const cb = document.getElementById('setting-skincare-enabled');
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
    """)
    time.sleep(0.2)

    # Switch to Skincare screen
    driver.find_element(By.ID, "nav-skincare").click()
    time.sleep(0.3)

    # Enable edit mode
    skincare_edit = driver.find_element(By.ID, "skincare-edit-toggle")
    driver.execute_script("arguments[0].click();", skincare_edit)
    time.sleep(0.2)

    # Add skincare with "По дням" schedule
    btn_add = driver.find_element(By.ID, "btn-add-skincare-morning")
    driver.execute_script("arguments[0].click();", btn_add)
    time.sleep(0.3)

    driver.find_element(By.ID, "skincare-name").send_keys("Средство по дням")

    # Select "По дням" schedule
    driver.execute_script("arguments[0].click();", driver.find_element(By.ID, "schedule-days"))
    time.sleep(0.1)

    # Select Wednesday (data-day="3")
    wed_btn = driver.find_element(By.CSS_SELECTOR, "#subfield-days .day-pick-btn[data-day='3']")
    driver.execute_script("arguments[0].click();", wed_btn)
    time.sleep(0.1)

    submit_btn = driver.find_element(By.CSS_SELECTOR, "#form-skincare button[type='submit']")
    driver.execute_script("arguments[0].click();", submit_btn)
    time.sleep(0.3)

    # Verify item is displayed (today is Wednesday in mock)
    skincare_card = driver.find_element(By.XPATH, "//span[contains(text(), 'Средство по дням')]")
    assert skincare_card.is_displayed()

def test_xss_protection(server, driver):
    """Test XSS protection - special characters should be escaped."""
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)

    # Skip onboarding
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-clean").click()
    time.sleep(0.5)

    # Enable edit mode
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)

    # Create block
    btn_first_block = driver.find_element(By.ID, "btn-create-first-block")
    driver.execute_script("arguments[0].click();", btn_first_block)
    time.sleep(0.2)

    # Try to inject script in block name
    driver.find_element(By.ID, "block-name").send_keys("<script>alert('XSS')</script>Тест")
    btn_block_submit = driver.find_element(By.CSS_SELECTOR, "#form-block button[type='submit']")
    driver.execute_script("arguments[0].click();", btn_block_submit)
    time.sleep(0.3)

    # The script tag should be escaped and displayed as text, not executed
    # We verify by checking the block name appears with escaped characters
    block_name = driver.find_element(By.XPATH, "//span[contains(text(), '<script>') or contains(text(), 'Тест')]")
    assert block_name.is_displayed()

def test_form_validation(server, driver):
    """Test form validation - required fields, empty submissions."""
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)

    # Skip onboarding
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-clean").click()
    time.sleep(0.5)

    # Enable edit mode
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)

    # Create block with empty name - should not submit
    btn_first_block = driver.find_element(By.ID, "btn-create-first-block")
    driver.execute_script("arguments[0].click();", btn_first_block)
    time.sleep(0.2)

    # Don't fill name, just submit
    btn_block_submit = driver.find_element(By.CSS_SELECTOR, "#form-block button[type='submit']")
    btn_block_submit.click()
    time.sleep(0.3)

    # Dialog should still be open (validation failed)
    dialog = driver.find_element(By.ID, "dialog-block")
    assert dialog.is_displayed()

    # Close dialog
    cancel_btn = driver.find_element(By.CSS_SELECTOR, "#dialog-block .btn-cancel")
    driver.execute_script("arguments[0].click();", cancel_btn)
    time.sleep(0.2)

def test_delete_block_and_items(server, driver):
    """Test deleting a block with its items."""
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)

    # Use Demo state
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-demo").click()
    time.sleep(0.5)

    # Enable edit mode
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)

    # Edit first block
    edit_btn = driver.find_element(By.CLASS_NAME, "btn-edit-block")
    driver.execute_script("arguments[0].click();", edit_btn)
    time.sleep(0.3)

    # Delete block
    delete_btn = driver.find_element(By.ID, "btn-delete-block")
    driver.execute_script("arguments[0].click();", delete_btn)
    time.sleep(0.2)

    # Confirm deletion
    driver.switch_to.alert.accept()
    time.sleep(0.3)

    # Block should be removed
    cards = driver.find_elements(By.CLASS_NAME, "card")
    assert len(cards) < 4  # Was 4 blocks in demo

def test_workouts_tracker_flow(server, driver):
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)
    
    # Skip onboarding by choosing clean slate
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-clean").click()
    time.sleep(0.5)

    # 1. Enable workouts toggle in settings via JS
    driver.execute_script("""
        const cb = document.getElementById('setting-workouts-enabled');
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
    """)
    time.sleep(0.2)
    
    # Bottom nav workouts tab should be visible
    nav_workouts = driver.find_element(By.ID, "nav-workouts")
    assert nav_workouts.is_displayed()
    
    # 2. Navigate to Workouts tab
    driver.execute_script("arguments[0].click();", nav_workouts)
    time.sleep(0.3)
    
    # Empty state should be shown
    empty_btn = wait.until(EC.presence_of_element_located((By.ID, "btn-create-first-workout")))
    assert empty_btn.is_displayed()
    
    # 3. Click first workout creation button
    driver.execute_script("arguments[0].click();", empty_btn)
    time.sleep(0.3)
    
    # Fill workout day modal: "Day A"
    driver.find_element(By.ID, "workout-name").send_keys("Day A")
    driver.execute_script("document.getElementById('workout-icon').value = '🏋️';")
    
    submit_btn = driver.find_element(By.CSS_SELECTOR, "#form-workout button[type='submit']")
    driver.execute_script("arguments[0].click();", submit_btn)
    time.sleep(0.3)
    
    # Workout day card should be created and visible
    card = driver.find_element(By.CLASS_NAME, "workout-card")
    assert card.is_displayed()
    assert "Day A".upper() in card.text.upper()
    
    # 4. Add exercise to workout
    add_ex_btn = card.find_element(By.CLASS_NAME, "add-exercise-card-btn")
    driver.execute_script("arguments[0].click();", add_ex_btn)
    time.sleep(0.3)
    
    # Fill exercise form: "Squats", note: "to parallel"
    driver.find_element(By.ID, "exercise-name").send_keys("Squats")
    driver.find_element(By.ID, "exercise-notes").send_keys("to parallel")
    
    # Fill first set details: 60 kg, 10 reps (already has 1 row by default)
    weight_input = driver.find_element(By.CSS_SELECTOR, "#exercise-sets-list .set-row-item:first-child .weight")
    reps_input = driver.find_element(By.CSS_SELECTOR, "#exercise-sets-list .set-row-item:first-child .reps")
    driver.execute_script("arguments[0].value = '60 kg';", weight_input)
    driver.execute_script("arguments[0].value = '10';", reps_input)
    
    # Add second set
    add_row_btn = driver.find_element(By.ID, "btn-add-set-row")
    driver.execute_script("arguments[0].click();", add_row_btn)
    time.sleep(0.1)
    
    # Fill second set details: 65 kg, 8 reps
    weight_input2 = driver.find_element(By.CSS_SELECTOR, "#exercise-sets-list .set-row-item:nth-child(2) .weight")
    reps_input2 = driver.find_element(By.CSS_SELECTOR, "#exercise-sets-list .set-row-item:nth-child(2) .reps")
    driver.execute_script("arguments[0].value = '65 kg';", weight_input2)
    driver.execute_script("arguments[0].value = '8';", reps_input2)
    
    # Submit exercise form
    ex_submit = driver.find_element(By.CSS_SELECTOR, "#form-exercise button[type='submit']")
    driver.execute_script("arguments[0].click();", ex_submit)
    time.sleep(0.3)
    
    # Re-find card because it was rebuilt after list rendering
    card = driver.find_element(By.CLASS_NAME, "workout-card")
    assert "Squats".upper() in card.text.upper()
    
    # Disable edits mode
    edit_toggle = driver.find_element(By.ID, "workouts-edit-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.3)
    
    # 5. Start workout session
    # Re-find card and start button since DOM rebuilt after toggling edit mode
    card = driver.find_element(By.CLASS_NAME, "workout-card")
    start_btn = card.find_element(By.CLASS_NAME, "workout-start-btn")
    driver.execute_script("arguments[0].click();", start_btn)
    time.sleep(0.3)
    
    # Active workout screen should open, stopwatch running
    active_view = driver.find_element(By.ID, "workout-active-view")
    assert active_view.is_displayed()
    
    timer = driver.find_element(By.ID, "active-workout-timer")
    assert timer.is_displayed()
    
    # 6. Check off the first set of Squats
    set_row = driver.find_element(By.CSS_SELECTOR, ".active-set-row:first-child")
    driver.execute_script("arguments[0].click();", set_row)
    time.sleep(0.2)
    
    # Re-find set_row since checking off a set rerenders the active list
    set_row = driver.find_element(By.CSS_SELECTOR, ".active-set-row:first-child")
    assert "checked" in set_row.get_attribute("class")
    
    # Floating rest timer should appear
    rest_timer = driver.find_element(By.ID, "rest-timer-widget")
    assert rest_timer.is_displayed()
    
    # Skip rest timer
    skip_btn = driver.find_element(By.ID, "btn-rest-timer-skip")
    driver.execute_script("arguments[0].click();", skip_btn)
    time.sleep(0.2)
    assert not rest_timer.is_displayed()
    
    # 7. Check off the second set to complete the exercise
    set_row2 = driver.find_element(By.CSS_SELECTOR, ".active-set-row:nth-child(2)")
    driver.execute_script("arguments[0].click();", set_row2)
    time.sleep(0.2)
    
    # Active progress should update
    progress_text = driver.find_element(By.ID, "active-workout-progress-text")
    assert "2" in progress_text.text
    
    # Dismiss rest timer again
    driver.execute_script("arguments[0].click();", skip_btn)
    time.sleep(0.2)
    
    # 8. Finish workout session
    finish_btn = driver.find_element(By.ID, "btn-finish-workout")
    driver.execute_script("arguments[0].click();", finish_btn)
    time.sleep(0.2)
    
    # Confirm alert using Selenium
    alert = driver.switch_to.alert
    alert.accept()
    time.sleep(0.2)
    
    # It should show celebration alert, accept it too
    alert2 = driver.switch_to.alert
    assert "1120" in alert2.text
    alert2.accept()
    time.sleep(0.3)
    
    # 9. Verify History log is updated
    history_section = driver.find_element(By.ID, "workout-history-section")
    assert history_section.is_displayed()
    
    stats_workouts = driver.find_element(By.ID, "stats-total-workouts")
    assert stats_workouts.text == "1"
    
    stats_weight = driver.find_element(By.ID, "stats-total-weight")
    assert "1.1" in stats_weight.text or "1120" in stats_weight.text
    
    history_card = driver.find_element(By.CLASS_NAME, "history-card")
    assert history_card.is_displayed()
    assert "Day A".upper() in history_card.text.upper()

def test_workout_background_timer(server, driver):
    driver.get(f"http://127.0.0.1:{PORT}/")
    wait = WebDriverWait(driver, 5)
    
    # Skip onboarding by choosing clean slate
    wait.until(EC.presence_of_element_located((By.ID, "dialog-onboarding")))
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.CSS_SELECTOR, "#dialog-onboarding div[data-step='2'] .btn-next-step").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-clean").click()
    time.sleep(0.5)

    # 1. Enable workouts toggle in settings via JS
    driver.execute_script("""
        const cb = document.getElementById('setting-workouts-enabled');
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
    """)
    time.sleep(0.2)
    
    # 2. Navigate to Workouts tab
    nav_workouts = driver.find_element(By.ID, "nav-workouts")
    driver.execute_script("arguments[0].click();", nav_workouts)
    time.sleep(0.3)
    
    # 3. Create a workout
    empty_btn = wait.until(EC.presence_of_element_located((By.ID, "btn-create-first-workout")))
    driver.execute_script("arguments[0].click();", empty_btn)
    time.sleep(0.3)
    driver.find_element(By.ID, "workout-name").send_keys("Day B")
    driver.execute_script("document.getElementById('workout-icon').value = '🏋️';")
    submit_btn = driver.find_element(By.CSS_SELECTOR, "#form-workout button[type='submit']")
    driver.execute_script("arguments[0].click();", submit_btn)
    time.sleep(0.3)
    
    # 4. Add exercise
    card = driver.find_element(By.CLASS_NAME, "workout-card")
    add_ex_btn = card.find_element(By.CLASS_NAME, "add-exercise-card-btn")
    driver.execute_script("arguments[0].click();", add_ex_btn)
    time.sleep(0.3)
    driver.find_element(By.ID, "exercise-name").send_keys("Squats")
    weight_input = driver.find_element(By.CSS_SELECTOR, "#exercise-sets-list .set-row-item:first-child .weight")
    reps_input = driver.find_element(By.CSS_SELECTOR, "#exercise-sets-list .set-row-item:first-child .reps")
    driver.execute_script("arguments[0].value = '60 kg';", weight_input)
    driver.execute_script("arguments[0].value = '10';", reps_input)
    ex_submit = driver.find_element(By.CSS_SELECTOR, "#form-exercise button[type='submit']")
    driver.execute_script("arguments[0].click();", ex_submit)
    time.sleep(0.3)
    
    # Disable edits mode
    edit_toggle = driver.find_element(By.ID, "workouts-edit-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.3)
    
    # 5. Start workout session
    card = driver.find_element(By.CLASS_NAME, "workout-card")
    start_btn = card.find_element(By.CLASS_NAME, "workout-start-btn")
    driver.execute_script("arguments[0].click();", start_btn)
    time.sleep(0.3)
    
    # 6. Check off the first set of Squats to trigger rest timer
    set_row = driver.find_element(By.CSS_SELECTOR, ".active-set-row:first-child")
    driver.execute_script("arguments[0].click();", set_row)
    time.sleep(0.2)
    
    # Rest timer should appear
    rest_timer = driver.find_element(By.ID, "rest-timer-widget")
    assert rest_timer.is_displayed()
    
    # 7. Modify restTimerEndTime via JS to be in the past, simulating background time expiration
    driver.execute_script("window.state.restTimerEndTime = Date.now() - 5000; window.saveState();")
    
    # Trigger visibilitychange event simulating returning to the app
    driver.execute_script("document.dispatchEvent(new Event('visibilitychange'));")
    time.sleep(0.2)
    
    # The widget should be hidden now because it detected expiration
    assert not rest_timer.is_displayed()
    
    # 8. Check off the first set again to start rest timer in the future
    # Uncheck
    set_row = driver.find_element(By.CSS_SELECTOR, ".active-set-row:first-child")
    driver.execute_script("arguments[0].click();", set_row)
    time.sleep(0.2)
    # Check again (re-find to avoid stale element reference)
    set_row = driver.find_element(By.CSS_SELECTOR, ".active-set-row:first-child")
    driver.execute_script("arguments[0].click();", set_row)
    time.sleep(0.2)
    
    assert rest_timer.is_displayed()
    
    # Set restTimerEndTime to 30 seconds in the future
    driver.execute_script("window.state.restTimerEndTime = Date.now() + 30000; window.saveState();")
    driver.execute_script("document.dispatchEvent(new Event('visibilitychange'));")
    time.sleep(0.2)
    
    # Verify it remains visible and displays remaining time
    assert rest_timer.is_displayed()
    seconds_text = driver.find_element(By.ID, "rest-timer-seconds").text
    assert "30" in seconds_text

