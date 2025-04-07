import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# SMTP server details
smtp_server = "smtp-relay.brevo.com"
port = 587
login = "7a8154001@smtp-brevo.com"  # Use the email address that matches your Brevo sender
password = "FHwxSTb7rYXvj4IB"  # Your Brevo SMTP password

# Create the email headers and body
message = MIMEMultipart()
message["From"] = "admin@ourvedas.in"  # Must match your validated sender in Brevo
message["To"] = "milly.tibrewal@gmail.com"
message["Subject"] = "Welcome to RAGVerse!!"

# Add body content
body = "This is welcome messsage...."
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
except Exception as e:
    print(f"Failed to send email: {e}")
