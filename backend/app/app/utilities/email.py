import logging
from pathlib import Path
from typing import Any, Dict

import emails
from emails.template import JinjaTemplate

from app.core.config import settings
from app.schemas import EmailContent, EmailValidation
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_welcome_email(receiver_email, subject, body):
    """
    Send a welcome email using predefined SMTP server details and credentials.

    :param receiver_email: Email address of the recipient
    :param subject: Subject of the email
    :param body: Body content of the email
    :return: None
    """

    # SMTP server details
    smtp_server = settings.SMTP_HOST
    port = 587
    login = settings.SMTP_USER 
    password = settings.SMTP_PASSWORD  

    # Email details
    sender_email = "admin@domain.in"  # Must match your validated sender in Brevo

    # Create the email headers and body
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject

    # Attach the body content as plain text
    message.attach(MIMEText(body, "plain"))

    # Convert the message to a string
    email_text = message.as_string()

    # Set up the server and send the email
    try:
        server = smtplib.SMTP(smtp_server, port)
        server.starttls()  # Secure the connection
        server.login(login, password)
        server.sendmail(message["From"], message["To"], email_text)
        server.quit()
        print("Email sent successfully!")
    except smtplib.SMTPAuthenticationError as e:
        print(f"Authentication failed: {e.smtp_code} - {e.smtp_error}")
    except Exception as e:
        print(f"Failed to send email: {e}")


def send_email(
    email_to: str,
    subject_template: str = "",
    html_template: str = "",
    environment: Dict[str, Any] = {},
) -> None:
    assert settings.EMAILS_ENABLED, "no provided configuration for email variables"
    sender_name="Ragverse"
    sender_email="admin@domain.in"
    message = emails.Message(
        subject=JinjaTemplate(subject_template),
        html=JinjaTemplate(html_template),
        mail_from=(sender_name, sender_email),
    )
    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}

    if settings.SMTP_TLS:
        # https://python-emails.readthedocs.io/en/latest/
        smtp_options["ssl"] = False

    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD
    # Add common template environment elements
    # print(settings.SERVER_HOST)
    
    smtp_options["tls"] = True 
    smtp_options["ssl"] = False
    environment["server_host"] = settings.SERVER_HOST
    environment["server_name"] = settings.SERVER_NAME
    environment["server_bot"] = settings.SERVER_BOT
    print(environment)
    print(smtp_options)
    try:
        response = message.send(to=email_to, render=environment, smtp=smtp_options)
        logging.info(f"Email sent successfully: {response}")
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")



def send_email_validation_email(data: EmailValidation) -> None:
    subject = f"{settings.PROJECT_NAME} - {data.subject}"
    server_host = settings.SERVER_HOST
    link = f"{server_host}?token={data.token}"
    with open(Path(settings.EMAIL_TEMPLATES_DIR) / "confirm_email.html") as f:
        template_str = f.read()
    send_email(
        email_to=data.email,
        subject_template=subject,
        html_template=template_str,
        environment={"link": link},
    )


def send_web_contact_email(data: EmailContent) -> None:
    subject = f"{settings.PROJECT_NAME} - {data.subject}"
    with open(Path(settings.EMAIL_TEMPLATES_DIR) / "web_contact_email.html") as f:
        template_str = f.read()
    send_email(
        email_to=settings.EMAILS_TO_EMAIL,
        subject_template=subject,
        html_template=template_str,
        environment={"content": data.content, "email": data.email},
    )


def send_test_email(email_to: str) -> None:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    with open(Path(settings.EMAIL_TEMPLATES_DIR) / "test_email.html") as f:
        template_str = f.read()
    send_email(
        email_to=email_to,
        subject_template=subject,
        html_template=template_str,
        environment={"project_name": settings.PROJECT_NAME, "email": email_to},
    )


def send_magic_login_email(email_to: str, token: str) -> None:
    project_name = settings.PROJECT_NAME
    subject = f"Your {project_name} magic login"
    with open(Path(settings.EMAIL_TEMPLATES_DIR) / "magic_login.html") as f:
        template_str = f.read()
    server_host = settings.SERVER_HOST
    link = f"{server_host}?magic={token}"
    send_email(
        email_to=email_to,
        subject_template=subject,
        html_template=template_str,
        environment={
            "project_name": settings.PROJECT_NAME,
            "valid_minutes": int(settings.ACCESS_TOKEN_EXPIRE_SECONDS / 60),
            "link": link,
        },
    )


def send_reset_password_email(email_to: str, email: str, token: str) -> None:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Password recovery for user {email}"
    with open(Path(settings.EMAIL_TEMPLATES_DIR) / "reset_password.html") as f:
        template_str = f.read()
    server_host = settings.SERVER_HOST
    link = f"{server_host}/reset-password?token={token}"
    print(link)
    send_email(
        email_to=email_to,
        subject_template=subject,
        html_template=template_str,
        environment={
            "project_name": project_name,
            "username": email,
            "email": email_to,
            "valid_hours": int(settings.ACCESS_TOKEN_EXPIRE_SECONDS / 60),
            "link": link,
        },
    )


def send_new_account_email(email_to: str, username: str, password: str) -> None:

    project_name = settings.PROJECT_NAME

    subject = f"{project_name} - New account for user {username}"

    with open(Path(settings.EMAIL_TEMPLATES_DIR) / "new_account.html") as f:
        template_str = f.read()
    link = settings.SERVER_HOST
    send_email(
        email_to=email_to,
        subject_template=subject,
        html_template=template_str,
        environment={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "password": password,
            "email": email_to,
            "link": link,
        },
    )
