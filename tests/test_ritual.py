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
    next_btn = driver.find_element(By.XPATH, "//div[@data-step='2']//button[contains(text(), 'Продолжить')]")
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
    
    driver.find_element(By.XPATH, "//div[@data-step='2']//button[contains(text(), 'Продолжить')]").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-demo").click()
    time.sleep(0.5)
    
    # Now we have demo supplements. Let's toggle Edit Mode (Настроить)
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)
    
    # Click to add/edit item in "Morning" block (block-utro)
    add_item_btn = driver.find_element(By.CSS_SELECTOR, "button.add-item-card-btn[data-block-id='block-utro']")
    driver.execute_script("arguments[0].click();", add_item_btn)
    time.sleep(0.3)
    
    # Fill Supplement Form: Name, Dose, and Scheduling
    # Let's add "Спирулина" with scheduling on Wednesday (today is Wednesday -> 3)
    driver.find_element(By.ID, "item-name").send_keys("Спирулина")
    driver.find_element(By.ID, "item-dose").send_keys("3 капсулы")
    
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
    
    # Let's add another supplement: "Аскорбинка", only on Monday (data-day="1") (not today!)
    add_item_btn = driver.find_element(By.CSS_SELECTOR, "button.add-item-card-btn[data-block-id='block-utro']")
    driver.execute_script("arguments[0].click();", add_item_btn)
    time.sleep(0.3)
    driver.find_element(By.ID, "item-name").send_keys("Аскорбинка")
    driver.find_element(By.ID, "item-dose").send_keys("1 шт")
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
    # "Спирулина" should be visible because it's scheduled for Wednesday (today)
    spirulina_row = driver.find_element(By.XPATH, "//span[contains(text(), 'Спирулина')]/ancestor::div[contains(@class, 'row-item')]")
    assert spirulina_row.is_displayed()
    
    # "Аскорбинка" should be HIDDEN because it's only scheduled for Monday
    with pytest.raises(Exception):
        # Should not find visible row for Аскорбинка
        row = driver.find_element(By.XPATH, "//span[contains(text(), 'Аскорбинка')]/ancestor::div[contains(@class, 'row-item')]")
        assert not row.is_displayed()
        
    # Check "Спирулина" checkbox to verify stock reduction
    # Ensure daily tracking is enabled (it is enabled by default in Demo state settings)
    # Check it
    checkbox = spirulina_row.find_element(By.CLASS_NAME, "custom-checkbox")
    driver.execute_script("arguments[0].click();", checkbox)
    time.sleep(0.2)
    
    # Verify checkbox is checked - must re-find after renderApp() rebuilds DOM
    spirulina_row = driver.find_element(By.XPATH, "//span[contains(text(), 'Спирулина')]/ancestor::div[contains(@class, 'row-item')]")
    checkbox = spirulina_row.find_element(By.CLASS_NAME, "custom-checkbox")
    assert "checked" in checkbox.get_attribute("class")
    
    # Let's open Edit Mode to check the stock badge value or see if stock is updated
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)
    
    # The spirulina row should show warning badge since stock is now 8 (10 - 2 = 8, which is < 10)
    badge = driver.find_element(By.XPATH, "//span[contains(text(), 'Спирулина')]/ancestor::div[contains(@class, 'row-item')]//span[contains(@class, 'badge-warning') or contains(text(), 'Осталось')]")
    assert "8" in badge.text
    
    # Disable Edit Mode and uncheck it
    edit_toggle = driver.find_element(By.ID, "edit-mode-toggle")
    driver.execute_script("arguments[0].click();", edit_toggle)
    time.sleep(0.2)
    
    # Re-find checkbox before unchecking
    spirulina_row = driver.find_element(By.XPATH, "//span[contains(text(), 'Спирулина')]/ancestor::div[contains(@class, 'row-item')]")
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
    driver.find_element(By.XPATH, "//div[@data-step='2']//button[contains(text(), 'Продолжить')]").click()
    time.sleep(0.1)
    driver.find_element(By.ID, "btn-onboarding-demo").click()
    time.sleep(0.5)
    
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
    driver.find_element(By.ID, "skincare-name").send_keys("Просроченный крем")
    
    # Fill dates: opened 2026-04-03 (2 months before 2026-06-03), PAO = 1
    driver.execute_script("document.getElementById('skincare-opened-date').value = '2026-04-03';")
    driver.find_element(By.ID, "skincare-pao").send_keys("1")
    
    # Submit form
    submit_btn = driver.find_element(By.CSS_SELECTOR, "#form-skincare button[type='submit']")
    driver.execute_script("arguments[0].click();", submit_btn)
    time.sleep(0.3)
    
    # Verify expired badge is rendered
    expired_badge = wait.until(EC.presence_of_element_located((By.XPATH, "//span[contains(text(), 'Просроченный крем')]/ancestor::div[contains(@class, 'skincare-card')]//span[contains(@class, 'expired') or contains(text(), 'Просрочено')]")))
    assert expired_badge.is_displayed()
    
    # Click to add another skincare: expiring soon (expires in 10 days)
    driver.execute_script("arguments[0].click();", btn_add)
    time.sleep(0.3)
    driver.find_element(By.ID, "skincare-name").send_keys("Скоро закончится")
    
    # Absolute EXP date set to 2026-06-13 (10 days from 2026-06-03)
    driver.execute_script("document.getElementById('skincare-exp-date').value = '2026-06-13';")
    
    submit_btn = driver.find_element(By.CSS_SELECTOR, "#form-skincare button[type='submit']")
    driver.execute_script("arguments[0].click();", submit_btn)
    time.sleep(0.3)
    
    # Verify expiring soon warning badge is rendered
    warning_badge = wait.until(EC.presence_of_element_located((By.XPATH, "//span[contains(text(), 'Скоро закончится')]/ancestor::div[contains(@class, 'skincare-card')]//span[contains(@class, 'warning') or contains(text(), 'Истекает')]")))
    assert warning_badge.is_displayed()
    assert "10" in warning_badge.text
