const User = require('../../models/user');
const Student = require('../../models/student');
const { sendOTP } = require('../../config/sms'); 

// Send OTP for Mobile Login/Register
const requestOTP = async (req, res) => {
  try {
    const { phone_number } = req.body;
    console.log(phone_number);
    
    if (!phone_number) return res.status(400).json({ error: 'Phone number is required.' });
    const otp = await User.generateOTP(phone_number); 
    await sendOTP(phone_number, otp);
    res.status(200).json({ message: 'OTP sent' });
  } catch (err) {
    console.error('OTP request error:', err);
    res.status(500).json({ error: 'OTP generation failed.' });
  }
};


async function sendOtpController(req, res) {
  const { phone_number, otp } = req.body;
  try {
    await sendOTP(phone_number, otp);
    res.json({ message: 'OTP sent (trial: only to verified numbers).' });
  } catch (err) {
    console.error('SMS send error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP. Make sure number is verified in Twilio.' });
  }
}






// Verify OTP for mobile login/register
const verifyOTP = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;
    if (!phone_number || !otp) return res.status(400).json({ error: 'Phone number and OTP are required.' });

    const result = await User.verifyOTP(phone_number, otp);
    if (!result) return res.status(401).json({ error: 'Invalid or expired OTP.' });
    if (result.user && result.user.first_name) {
      res.status(200).json(result);
    } else {
      res.status(200).json({ exists: false, phone_number });
    }
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'OTP verification failed.' });
  }
};

// Register user (after OTP for new users)
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password_hash, phone_number, role } = req.body;
    if (!first_name || !last_name || !email || !password_hash) {
      return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) return res.status(400).json({ error: 'Email already exists.' });

    const existingPhone = await User.findByPhone(phone_number);
    if (existingPhone && existingPhone.first_name) return res.status(400).json({ error: 'Phone number already exists.' });

    // Create new user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password_hash,
      phone_number,
      role: role || 'student'
    });

    //Create new student
    if (user.role === 'student') {
      await Student.create({
        userId: user.id,
        firstName: first_name,
        lastName: last_name,
        email,
        phone: phone_number,
        enrollmentDate: new Date(),
        status: 'active',
        program: '',
        semester: '',
        year: '',
        courses: null
      });
    }
    res.status(201).json(user);
  } catch (err) {
    console.error('User registration error:', err);
    res.status(500).json({ error: 'User registration failed.' });
  }
};

// Login with email
const loginWithEmail = async (req, res) => {
  try {
    const { email, password_hash } = req.body;
    if (!email || !password_hash) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await User.verifyEmailPassword(email, password_hash);
    if (!result) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
};



// Get all users (for admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};


module.exports = {
  requestOTP,
  verifyOTP,
  register,
  loginWithEmail,
  getAllUsers,    
  getProfile     
};