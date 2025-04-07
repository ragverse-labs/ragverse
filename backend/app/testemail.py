import smtplib

smtp_server = "smtp-relay.brevo.com"
port = 587
login = "7a8154001@smtp-brevo.com"  # Your email address
# login = "admin@ourvedas.in"
password = "FHwxSTb7rYXvj4IB"   # Your Brevo SMTP password
# password = "ragIsMagic@12" 
# Set up the server
server = smtplib.SMTP(smtp_server, port)
server.starttls()  # Secure the connection

# Login to the server
server.login(login, password)

# Send email
sender_email = "admin@ourvedas.in"
receiver_email = "milly.tibrewal@gmail.com"  # Replace with a test recipient email
message = """\
Subject: Test CCC New Email

This is a test email sent from Python using Brevo's SMTP relay."""

server.sendmail(sender_email, receiver_email, message)
server.quit()

print("Email sent successfully!")
