import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import UnexpectedAlertPresentException, NoAlertPresentException
import time

# Load email
with open("test_user_email.txt", "r") as f:
    test_email = f.read().strip()

class ApplySessionTest(unittest.TestCase):
    def setUp(self):
        service = Service(executable_path="./chromedriver.exe")
        self.driver = webdriver.Chrome(service=service)
        self.driver.implicitly_wait(10)

        # Login
        self.driver.get("http://localhost:3000/login")
        try:
            self.driver.find_element(By.XPATH, "//input[@type='email']").send_keys(test_email)
            self.driver.find_element(By.XPATH, "//input[@type='password']").send_keys("Password@123")
            self.driver.find_element(By.XPATH, "//button[contains(text(), 'Sign in')]").click()
            time.sleep(2)
        except UnexpectedAlertPresentException:
            alert = self.driver.switch_to.alert
            print("Login failed with alert:", alert.text)
            alert.accept()
            self.fail("❌ Login failed. Check credentials.")

    def test_apply_to_session(self):
        driver = self.driver
        driver.get("http://localhost:3000/sessions/1")
        time.sleep(2)

        # Select "Mentee"
        mentee_radio = driver.find_element(By.XPATH, "//input[@type='radio' and @value='mentee']")
        mentee_radio.click()

        # Click Apply
        driver.find_element(By.XPATH, "//button[contains(text(), 'Apply')]").click()
        time.sleep(2)

        # Handle alert after apply
        try:
            alert = driver.switch_to.alert
            print("📢 Alert after applying:", alert.text)
            alert.accept()
            time.sleep(1)
        except NoAlertPresentException:
            print("No alert appeared after apply.")

        # Assert redirected to survey page
        current_url = driver.current_url
        print("🔍 Current URL:", current_url)
        self.assertIn("/survey", current_url)
        self.assertIn("sessionId=1", current_url)
        print("✅ Successfully applied and redirected to survey.")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
