import unittest
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

class RegisterTest(unittest.TestCase):
    def setUp(self):
        service = Service(executable_path="./chromedriver.exe")
        self.driver = webdriver.Chrome(service=service)
        self.driver.get("http://localhost:3000/register")
        self.driver.maximize_window()
        self.wait = WebDriverWait(self.driver, 10)

    def test_register_user(self):
        driver = self.driver
        wait = self.wait

        # TEMP DEBUG: wait and print HTML to verify page is loaded correctly
        time.sleep(3)
        print("🧭 Current URL:", driver.current_url)
        print("📄 PAGE HTML (start):")
        print(driver.page_source[:2000])  # first 2000 characters

        # Generate unique email
        unique_email = f"selenium{int(datetime.now().timestamp())}@example.com"
        with open("test_user_email.txt", "w") as f:
            f.write(unique_email)

        # DEBUG: Check how many input fields are present
        inputs = driver.find_elements(By.TAG_NAME, "input")
        print(f"🔎 Found {len(inputs)} input fields:")
        for i, field in enumerate(inputs):
            print(f"{i+1}: type={field.get_attribute('type')}, placeholder={field.get_attribute('placeholder')}")

        # Try to locate the email field using common fallbacks
        try:
            email_input = (
                wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
                if any("email" in field.get_attribute("type") for field in inputs)
                else wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder*='email']")))
            )
            email_input.send_keys(unique_email)
        except Exception as e:
            print("❌ Could not find or interact with the email input field.")
            raise e

        # Password and confirm password fields (assumes order in DOM)
        try:
            password_inputs = driver.find_elements(By.XPATH, "//input[@type='password']")
            password_inputs[0].send_keys("Password@123")
            password_inputs[1].send_keys("Password@123")
        except Exception as e:
            print("❌ Could not find password fields.")
            raise e

        # Select a security question
        try:
            dropdown = wait.until(EC.presence_of_element_located((By.TAG_NAME, "select")))
            Select(dropdown).select_by_visible_text("What was the name of your first pet?")
        except Exception as e:
            print("❌ Failed to interact with security question dropdown.")
            raise e

        # Answer the security question
        try:
            answer_input = wait.until(
                EC.presence_of_element_located((By.XPATH, "//label[text()='Your Answer']/following-sibling::input"))
            )
            answer_input.send_keys("Sparky")
        except Exception as e:
            print("❌ Failed to locate or fill in the security answer.")
            raise e

        # Click submit button
        try:
            submit_btn = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Next')]"))
            )
            submit_btn.click()
        except Exception as e:
            print("❌ Failed to find or click submit button.")
            raise e

        # Allow time for redirect
        time.sleep(2)
        print("🔁 After submit, current URL:", driver.current_url)

        # Handle potential alert
        try:
            alert = driver.switch_to.alert
            print("⚠️ Alert text:", alert.text)
            alert.accept()
        except:
            pass  # No alert found

        # Verify the success URL
        self.assertIn("/register-success", driver.current_url, "❌ Did not redirect to /register-success")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
