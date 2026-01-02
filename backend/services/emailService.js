const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // Use SendGrid if configured, otherwise Gmail
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.EMAIL_PASSWORD // SendGrid API key
      }
    });
  }
  
  // Gmail configuration
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
};

// Send task reminder email
const sendTaskReminder = async (userEmail, userName, pendingTasks) => {
  try {
    const transporter = createTransporter();

    const taskList = pendingTasks
      .map((task, index) => `${index + 1}. ${task.title} (${task.priority} priority)`)
      .join('\n');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '🔔 TaskStreak Daily Reminder - Pending Tasks',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .task-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .task-item { padding: 10px; margin: 5px 0; background: #f3f4f6; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔥 TaskStreak</h1>
              <p>Daily Task Reminder</p>
            </div>
            <div class="content">
              <h2>Hi ${userName}! 👋</h2>
              <p>You have <strong>${pendingTasks.length}</strong> pending task${pendingTasks.length !== 1 ? 's' : ''} for today:</p>
              
              <div class="task-list">
                ${pendingTasks.map((task, index) => `
                  <div class="task-item">
                    <strong>${index + 1}. ${task.title}</strong><br>
                    <small>Priority: ${task.priority.toUpperCase()} ${task.dueDate ? `| Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}</small>
                  </div>
                `).join('')}
              </div>
              
              <p>Don't break your streak! Complete your tasks and keep building momentum. 💪</p>
              
              <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks" class="btn">View My Tasks</a>
              </center>
              
              <div class="footer">
                <p>You're receiving this email because you have pending tasks in TaskStreak.</p>
                <p>© 2025 TaskStreak. Keep building your productivity streak!</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Alias for custom reminders (same functionality as sendTaskReminder)
const sendReminderEmail = sendTaskReminder;

module.exports = { sendTaskReminder, sendReminderEmail };
