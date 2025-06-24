const User = require("../../models/user");



const loginWithEmail = async (req, res) => {
  try {
    const { email, password_hash } = req.body;
    if (!email || !password_hash) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const result = await User.verifyEmailPassword(email, password_hash);
    if (!result) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const accessToken = User.generateAccessToken(result.user);
    const refreshToken = User.generateRefreshToken(result.user);
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    
    
    res.status(200).json({ user: result.user, accessToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed." });
  }
};


module.exports = {
  loginWithEmail,
}



