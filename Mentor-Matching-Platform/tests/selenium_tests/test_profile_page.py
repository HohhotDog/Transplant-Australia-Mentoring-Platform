import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import UnexpectedAlertPresentException, NoAlertPresentException
import time

# Load the email used during registration
with open("test_user_email.txt", "r") as f:
    test_email = f.read().strip()

class ProfilePageTest(unittest.TestCase):
    def setUp(self):
        service = Service(executable_path="./chromedriver.exe")
        self.driver = webdriver.Chrome(service=service)
        self.driver.implicitly_wait(10)

        # Login first
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

        # Visit /profile and handle alerts
        self.driver.get("http://localhost:3000/profile")
        time.sleep(2)

        for i in range(2):
            try:
                alert = self.driver.switch_to.alert
                print(f"⚠️ Alert {i+1} detected:", alert.text)
                alert.accept()
                time.sleep(1)
            except NoAlertPresentException:
                break

        # If redirected to /profile-creation, fill the form
        if "/profile-creation" in self.driver.current_url:
            print("🔄 Auto-filling profile creation form...")
            self.fill_profile_form()
            
            # After submission, check if profile saved
            if "/profile-creation" in self.driver.current_url:
                self.fail("❌ Profile submission failed. Still on profile-creation page.")
            else:
                print("✅ Profile submitted successfully.")
                self.driver.get("http://localhost:3000/profile")
                time.sleep(2)

    def fill_profile_form(self):
        driver = self.driver

        driver.find_element(By.NAME, "first_name").send_keys("Selenium")
        driver.find_element(By.NAME, "last_name").send_keys("Bot")

        # Use JavaScript to set date + fire events
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

        Select(driver.find_element(By.NAME, "gender")).select_by_visible_text("Other")
        Select(driver.find_element(By.NAME, "aboriginal_or_torres_strait_islander")).select_by_visible_text("No")

        driver.find_element(By.NAME, "language_spoken_at_home").send_keys("English")
        driver.find_element(By.NAME, "living_situation").send_keys("With family")

        driver.find_element(By.XPATH, "//button[contains(text(), 'Create Account')]").click()
        time.sleep(2)

        # Accept any alerts after form submission
        for i in range(2):
            try:
                alert = driver.switch_to.alert
                print(f"⚠️ Post-submit alert {i+1}:", alert.text)
                alert.accept()
                time.sleep(1)
            except NoAlertPresentException:
                break

    def test_profile_load_and_buttons(self):
        driver = self.driver

        title = driver.find_element(By.XPATH, "//h2[contains(text(), 'My Profile')]")
        self.assertTrue(title.is_displayed())

        email_row = driver.find_element(By.XPATH, "//div[contains(@class, 'profile-info-row')][span[contains(text(), 'Email')]]")
        self.assertTrue(email_row.is_displayed())

        edit_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Edit Profile')]")
        self.assertTrue(edit_btn.is_displayed())
        edit_btn.click()
        time.sleep(1)
        self.assertIn("/profile-edit", driver.current_url)

        driver.back()
        time.sleep(1)

        security_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Password & Security')]")
        self.assertTrue(security_btn.is_displayed())
        security_btn.click()
        time.sleep(1)
        self.assertIn("/profile-security", driver.current_url)

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
