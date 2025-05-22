import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import UnexpectedAlertPresentException, NoSuchElementException, TimeoutException, ElementClickInterceptedException, NoSuchWindowException
import time
import traceback
import os

# Read test email from file
with open("test_user_email.txt", "r") as f:
    test_email = f.read().strip()

class SurveyFlowTest(unittest.TestCase):
    def setUp(self):
        service = Service(executable_path="./chromedriver.exe")
        self.driver = webdriver.Chrome(service=service)
        self.driver.implicitly_wait(10)
        self.wait = WebDriverWait(self.driver, 30)  # Increased to 30 seconds

        # Login with robust window handling
        try:
            self.driver.get("http://localhost:3000/login")
            if not self._is_window_open():
                self.fail("❌ Browser window closed unexpectedly during setup.")
            email_input = self.wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
            email_input.send_keys(test_email)
            self.driver.find_element(By.XPATH, "//input[@type='password']").send_keys("Password@123")
            sign_in_btn = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Sign in')]")))
            sign_in_btn.click()
            try:
                self.wait.until(EC.url_contains("/"))
                print("✅ Login successful")
            except TimeoutException:
                try:
                    alert = self.wait.until(EC.alert_is_present())
                    print(f"⚠️ Login alert: {alert.text}")
                    alert.accept()
                    self.fail("❌ Login failed due to alert.")
                except TimeoutException:
                    self.fail("❌ Login failed: No redirect or alert detected.")
        except (UnexpectedAlertPresentException, NoSuchWindowException) as e:
            print(f"❌ Login failed with error: {str(e)}")
            try:
                alert = self.driver.switch_to.alert
                print(f"⚠️ Login alert: {alert.text}")
                alert.accept()
            except:
                pass
            self.fail("❌ Login failed.")

    def _is_window_open(self):
        """Check if the browser window is still open."""
        try:
            self.driver.current_window_handle
            return True
        except NoSuchWindowException:
            return False

    def _check_js_errors(self, step_name):
        """Check for JavaScript errors in the browser console."""
        try:
            logs = self.driver.get_log("browser")
            errors = [log for log in logs if log["level"] == "SEVERE"]
            if errors:
                print(f"❌ {step_name} - JavaScript errors detected:")
                for error in errors:
                    print(f"  - {error['message']}")
                return True
            return False
        except Exception as e:
            print(f"⚠️ {step_name} - Could not check JS errors: {str(e)}")
            return False

    def _wait_for_page_load(self, step_name):
        """Wait for the page to fully load by checking for a stable element."""
        try:
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            self.wait.until(lambda driver: driver.execute_script("return document.readyState") == "complete")
            # Force JavaScript execution to ensure rendering
            self.driver.execute_script("window.dispatchEvent(new Event('load'))")
            time.sleep(2)  # Give extra time for React to render
            print(f"🟢 {step_name} - Page fully loaded")
        except TimeoutException as e:
            print(f"❌ {step_name} - Page failed to load: {str(e)}")
            raise

    def _cancel_previous_application(self):
        """Helper to cancel any existing application."""
        if not self._is_window_open():
            self.fail("❌ Browser window closed unexpectedly.")
        self.driver.get("http://localhost:3000/sessions/1")
        try:
            cancel_btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Cancel Apply')]"))
            )
            print("🔄 Cancelling previous application...")
            cancel_btn.click()
            try:
                self.wait.until(EC.alert_is_present())
                alert = self.driver.switch_to.alert
                print(f"⚠️ Cancel alert: {alert.text}")
                alert.accept()
            except TimeoutException:
                print("🟢 No alert after cancellation.")
        except (NoSuchElementException, TimeoutException):
            print("🟢 No existing application found.")

    def _fill_form_field(self, name, value):
        """Helper to fill a form field by name, handling disabled state."""
        try:
            # Try to find the field within a form container
            form = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))
            field = form.find_element(By.NAME, name)
            if field.is_displayed() and not field.get_attribute("disabled"):
                if field.tag_name == "select":
                    Select(field).select_by_value(value.lower())
                else:
                    field.clear()
                    field.send_keys(value)
                print(f"🟢 Filled {name} with {value}")
            else:
                print(f"⚠️ {name} is disabled or not displayed, skipping interaction")
        except TimeoutException as e:
            print(f"❌ Failed to find {name}: {str(e)}")
            # Save full page HTML to a file for debugging
            page_html = self.driver.page_source
            with open("debug_page_html.html", "w", encoding="utf-8") as f:
                f.write(page_html)
            print("🔍 Full page HTML saved to 'debug_page_html.html' for inspection.")
            raise

    def _click_next_button(self, step_name):
        """Helper to click the 'Next' button with robust handling."""
        if not self._is_window_open():
            self.fail(f"❌ Browser window closed unexpectedly at {step_name}.")
        try:
            next_btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Next')]"))
            )
            is_enabled = next_btn.is_enabled()
            is_displayed = next_btn.is_displayed()
            print(f"🔍 {step_name} - Next button enabled: {is_enabled}, displayed: {is_displayed}")
            
            if not is_enabled:
                self.fail(f"❌ {step_name} - Next button is disabled")
            
            if self._check_js_errors(step_name):
                self.fail(f"❌ {step_name} - Aborting due to JavaScript errors")
            
            self.driver.execute_script("arguments[0].scrollIntoView(true);", next_btn)
            time.sleep(0.5)
            
            try:
                next_btn.click()
            except ElementClickInterceptedException:
                print(f"⚠️ {step_name} - Standard click intercepted, trying JavaScript click")
                self.driver.execute_script("arguments[0].click();", next_btn)
            
            try:
                alert = self.wait.until(EC.alert_is_present())
                alert_text = alert.text
                print(f"⚠️ {step_name} - Alert after Next click: {alert_text}")
                alert.accept()
                self.fail(f"❌ {step_name} - Unexpected alert: {alert_text}")
            except TimeoutException:
                print(f"🟢 {step_name} - No alert after Next click")
        except TimeoutException as e:
            print(f"❌ {step_name} - Failed to click Next button: {str(e)}")
            traceback.print_exc()
            raise
        except Exception as e:
            print(f"❌ {step_name} - Unexpected error clicking Next button: {str(e)}")
            traceback.print_exc()
            raise

    def test_full_survey_flow(self):
        """Test the entire survey flow from start to submission."""
        self._cancel_previous_application()

        # SurveyStart
        print("📋 Starting SurveyStart")
        self.driver.get("http://localhost:3000/survey?sessionId=1&role=mentee")
        self._wait_for_page_load("SurveyStart")

        # Fill required fields on SurveyStart
        try:
            self._fill_form_field("gender", "male")
            self._fill_form_field("aboriginalTorresStraitIslander", "no")
            self._fill_form_field("languageOtherThanEnglish", "no")
            self._fill_form_field("livingSituation", "livingWithFamily")
        except Exception as e:
            print(f"❌ SurveyStart - Failed to fill form: {str(e)}")
            raise

        self._click_next_button("SurveyStart")

        # MatchingPreferences
        print("📋 Starting MatchingPreferences")
        Select(self.driver.find_element(By.NAME, "participantRole")).select_by_visible_text("Recipient")
        self._fill_multi_select("transplantType", ["Kidney", "Liver"])
        Select(self.driver.find_element(By.NAME, "transplantYear")).select_by_visible_text("2010")
        Select(self.driver.find_element(By.NAME, "meetingPreference")).select_by_visible_text("Online")
        self._fill_multi_select("sportsInterests", ["Running", "Cycling"])
        self.driver.find_element(By.XPATH, "//label[contains(text(), 'Peer Support')]/input").click()
        self.driver.find_element(By.XPATH, "//label[contains(text(), 'Goal Setting')]/input").click()
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        self._click_next_button("MatchingPreferences")

        # MatchingLifestyle
        print("📋 Starting MatchingLifestyle")
        Select(self.driver.find_element(By.NAME, "physicalExerciseFrequency")).select_by_visible_text("Often (2+×/week)")
        Select(self.driver.find_element(By.NAME, "likeAnimals")).select_by_visible_text("Like")
        Select(self.driver.find_element(By.NAME, "likeCooking")).select_by_visible_text("Neutral")
        Select(self.driver.find_element(By.NAME, "travelImportance")).select_by_visible_text("Very Important")
        Select(self.driver.find_element(By.NAME, "freeTimePreference")).select_by_visible_text("Neutral")
        sliders = self.driver.find_elements(By.XPATH, "//input[@type='range']")
        for slider in sliders:
            self.driver.execute_script("""
                arguments[0].value = 4;
                arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
            """, slider)
        self._click_next_button("MatchingLifestyle")

        # MatchingEnneagram
        print("📋 Starting MatchingEnneagram")
        sliders = self.driver.find_elements(By.XPATH, "//input[@type='range']")
        for slider in sliders:
            self.driver.execute_script("""
                arguments[0].value = 3;
                arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
            """, slider)
        self._click_next_button("MatchingEnneagram")

        # Confirm and Submit
        print("📋 Starting Enneagram Confirmation")
        confirm_box = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@type='checkbox']")))
        confirm_box.click()
        submit_btn = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Submit')]")))
        submit_btn.click()
        self.wait.until(EC.url_contains("/submitform"))
        self.assertIn("Application Submitted Successfully", self.driver.page_source, "Submission confirmation not found.")
        print("✅ Full survey flow test passed.")

    def test_survey_start_no_role(self):
        """Test SurveyStart page when no role is selected."""
        self._cancel_previous_application()
        self.driver.get("http://localhost:3000/survey?sessionId=1")  # No role in URL
        self._wait_for_page_load("SurveyStart")

        # Fill required fields on SurveyStart
        try:
            self._fill_form_field("gender", "male")
            self._fill_form_field("aboriginalTorresStraitIslander", "no")
            self._fill_form_field("languageOtherThanEnglish", "no")
            self._fill_form_field("livingSituation", "livingWithFamily")
        except Exception as e:
            print(f"❌ SurveyStart - Failed to fill form: {str(e)}")
            raise

        self._click_next_button("SurveyStart")
        try:
            alert = self.wait.until(EC.alert_is_present())
            alert_text = alert.text
            alert.accept()
            self.assertEqual(alert_text, "Please select a role before proceeding.", "Expected alert for missing role.")
            print("✅ SurveyStart no role test passed.")
        except TimeoutException:
            self.fail("❌ Expected alert for missing role not found.")

    def test_locked_form(self):
        """Test behavior when form is locked."""
        self._cancel_previous_application()
        self.driver.get("http://localhost:3000/survey?sessionId=1&role=mentee")
        self._wait_for_page_load("SurveyStart")

        # Check if form fields are disabled
        try:
            form = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))
            field = form.find_element(By.NAME, "gender")
            is_disabled = field.get_attribute("disabled") == "true"
            self.assertTrue(is_disabled, "Gender field should be disabled when form is locked.")
            print("✅ Locked form test passed.")
        except TimeoutException as e:
            print(f"❌ Locked form test failed: Gender field not found: {str(e)}")
            # Save full page HTML to a file for debugging
            page_html = self.driver.page_source
            with open("debug_page_html.html", "w", encoding="utf-8") as f:
                f.write(page_html)
            print("🔍 Full page HTML saved to 'debug_page_html.html' for inspection.")
            raise

    def test_matching_preferences_validation(self):
        """Test MatchingPreferences page with incomplete fields."""
        self._cancel_previous_application()
        self.driver.get("http://localhost:3000/survey?sessionId=1&role=mentee")
        self._wait_for_page_load("SurveyStart")

        # Fill required fields on SurveyStart
        try:
            self._fill_form_field("gender", "male")
            self._fill_form_field("aboriginalTorresStraitIslander", "no")
            self._fill_form_field("languageOtherThanEnglish", "no")
            self._fill_form_field("livingSituation", "livingWithFamily")
        except Exception as e:
            print(f"❌ SurveyStart - Failed to fill form: {str(e)}")
            raise

        self._click_next_button("SurveyStart")
        self._click_next_button("MatchingPreferences")
        try:
            alert = self.wait.until(EC.alert_is_present())
            alert.accept()
            print("✅ MatchingPreferences validation test passed.")
        except TimeoutException:
            self.fail("❌ Expected alert for incomplete fields not found.")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()