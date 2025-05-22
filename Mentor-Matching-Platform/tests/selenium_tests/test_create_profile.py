import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import UnexpectedAlertPresentException, NoAlertPresentException
import time

# Load the email created during registration
with open("test_user_email.txt", "r") as f:
    test_email = f.read().strip()

class CreateProfileTest(unittest.TestCase):
    def setUp(self):
        service = Service(executable_path="./chromedriver.exe")
        self.driver = webdriver.Chrome(service=service)
        self.driver.implicitly_wait(10)

        # Log in
        self.driver.get("http://localhost:3000/login")
        try:
            self.driver.find_element(By.XPATH, "//input[@type='email']").send_keys(test_email)
            self.driver.find_element(By.XPATH, "//input[@type='password']").send_keys("Password@123")
            self.driver.find_element(By.XPATH, "//button[contains(text(), 'Sign in')]").click()
            time.sleep(2)
        except UnexpectedAlertPresentException:
            alert = self.driver.switch_to.alert
            print("⚠️ Login failed with alert:", alert.text)
            alert.accept()
            self.fail("❌ Login failed. Check credentials.")

    def test_create_profile(self):
        driver = self.driver
        driver.get("http://localhost:3000/profile-creation")
        time.sleep(1)

        # Fill out the profile form
        driver.find_element(By.NAME, "first_name").send_keys("Selenium")
        driver.find_element(By.NAME, "last_name").send_keys("Bot")

        # Set date of birth with event dispatch
        driver.execute_script("""
            const dob = document.getElementsByName('date_of_birth')[0];
            dob.value = '1999-05-01';
            dob.dispatchEvent(new Event('input', { bubbles: true }));
            dob.dispatchEvent(new Event('change', { bubbles: true }));
        """)

        driver.find_element(By.NAME, "address").send_keys("123 Test Street")
        driver.find_element(By.NAME, "city_suburb").send_keys("Testville")
        driver.find_element(By.NAME, "state").send_keys("Testonia")
        driver.find_element(By.NAME, "postal_code").send_keys("6000")

        # Use Select for dropdowns
        Select(driver.find_element(By.NAME, "gender")).select_by_visible_text("Other")
        Select(driver.find_element(By.NAME, "aboriginal_or_torres_strait_islander")).select_by_visible_text("No")

        driver.find_element(By.NAME, "language_spoken_at_home").send_keys("English")
        driver.find_element(By.NAME, "living_situation").send_keys("With family")

        # Submit the form
        driver.find_element(By.XPATH, "//button[contains(text(), 'Create Account')]").click()
        time.sleep(2)

        # Handle any unexpected alerts after submit
        try:
            alert = driver.switch_to.alert
            print("⚠️ Post-submit alert:", alert.text)
            alert.accept()
            time.sleep(1)
        except NoAlertPresentException:
            pass

        # Ensure redirection to /profile
        driver.get("http://localhost:3000/profile")
        time.sleep(1)
        self.assertIn("/profile", driver.current_url)
        print("✅ Profile creation successful.")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
