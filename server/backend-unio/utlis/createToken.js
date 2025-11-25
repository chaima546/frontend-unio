import jwt from 'jsonwebtoken';

// This function generates a JWT, sets it as a secure HTTP-only cookie, and returns the token string.
const generateToken = (res, userId) => {
    // The payload uses 'id' to match the middleware expectations
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    // 'jwt' is the name of the cookie.
    // 'token' is the value of the cookie.
    // The options object makes the cookie secure and accessible only via HTTP(S).
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });

    // This allows the `loginUser` controller to include the token in the JSON response body.
    return token;
};

export default generateToken;
