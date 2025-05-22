import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import UnexpectedAlertPresentException, NoSuchElementException
import time

with open("test_user_email.txt", "r") as f:
    test_email = f.read().strip()

class LoginTest(unittest.TestCase):
    def setUp(self):
        service = Service(executable_path="./chromedriver.exe")
        self.driver = webdriver.Chrome(service=service)
        self.driver.implicitly_wait(10)

    def test_login_success(self):
        driver = self.driver
        driver.get("http://localhost:3000/login")

        try:
            # Fill in credentials
            driver.find_element(By.XPATH, "//input[@type='email']").send_keys(test_email)
            driver.find_element(By.XPATH, "//input[@type='password']").send_keys("Password@123")
            driver.find_element(By.XPATH, "//button[contains(text(), 'Sign in')]").click()
            time.sleep(2)

            # Optional: handle login alert
            try:
                alert = driver.switch_to.alert
                print("⚠️ Unexpected alert:", alert.text)
                alert.accept()
                self.fail("❌ Login failed due to alert.")
            except:
                pass

            # Check if redirected to dashboard or some protected page
            current_url = driver.current_url
            print("🔁 After login, current URL:", current_url)

            self.assertNotIn("/login", current_url, "❌ Still on login page — login may have failed.")
            print("✅ Login successful.")

        except NoSuchElementException as e:
            self.fail(f"❌ Login element not found: {e}")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
