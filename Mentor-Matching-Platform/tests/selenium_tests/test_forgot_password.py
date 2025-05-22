import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select
import time

class ForgotPasswordTest(unittest.TestCase):
    def setUp(self):
        service = Service(executable_path="./chromedriver.exe")
        self.driver = webdriver.Chrome(service=service)
        self.driver.get("http://localhost:3000/forgot-password")
        self.driver.implicitly_wait(10)

    def test_reset_password(self):
        driver = self.driver

        # Fill email
        driver.find_element(By.XPATH, "//input[@type='email']").send_keys("seleniumuser@example.com")

        # Select security question
        select = Select(driver.find_element(By.TAG_NAME, "select"))
        select.select_by_visible_text("What is your childhood pet's name?")

        # Answer
        driver.find_element(By.XPATH, "//input[@type='text']").send_keys("Sparky")

        # Password fields (new + confirm)
        password_fields = driver.find_elements(By.XPATH, "//input[@type='password']")
        password_fields[0].send_keys("NewPass@123")
        password_fields[1].send_keys("NewPass@123")

        # Submit
        driver.find_element(By.XPATH, "//button[contains(text(), 'Reset Password')]").click()

        # Wait and allow time for alert
        time.sleep(2)

        # Check if alert appeared
        # You may replace this with checking if password reset success message is displayed
        alert_text = driver.switch_to.alert.text
        self.assertIn("Password reset", alert_text)
        driver.switch_to.alert.accept()

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
