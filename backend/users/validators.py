import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class CustomPasswordValidator:
    """
    Validator to enforce strong password requirements:
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 digit
    - At least 1 special character
    """
    MIN_UPPER = 1
    MIN_LOWER = 1
    MIN_DIGIT = 1
    MIN_SPECIAL = 1

    def validate(self, password, _user=None):
        """
        Validate the password for required complexity.
        Raises ValidationError if requirements are not met.
        """
        missing = []
        if sum(1 for c in password if c.isupper()) < self.MIN_UPPER:
            missing.append(f"{self.MIN_UPPER} uppercase letter")
        if sum(1 for c in password if c.islower()) < self.MIN_LOWER:
            missing.append(f"{self.MIN_LOWER} lowercase letter")
        if sum(1 for c in password if c.isdigit()) < self.MIN_DIGIT:
            missing.append(f"{self.MIN_DIGIT} digit")
        if len(re.findall(r'[^A-Za-z0-9]', password)) < self.MIN_SPECIAL:
            missing.append(f"{self.MIN_SPECIAL} special character")
        if missing:
            msg = _(f"Password must contain at least: {', '.join(missing)}.")
            raise ValidationError([msg])

    def get_help_text(self):
        """
        Return a help text describing password requirements.
        """
        return _(
            "Your password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character."
        )