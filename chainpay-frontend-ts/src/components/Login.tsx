import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
// Import các icons từ thư viện react-icons (hoặc dùng text nếu bạn chưa cài)
// npm install react-icons
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

// Định nghĩa kiểu dữ liệu trả về từ API Login (Cần khớp với Backend)
interface AuthResponse {
    accessToken: string;
    tokenType: string;
    // Giả sử Backend trả về thêm thông tin user, hoặc chúng ta sẽ fetch sau
    user?: {
        id: number;
        username: string;
        walletAddress: string;
    }
}

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // 1. Gọi API Login
            const res = await axiosClient.post<AuthResponse>('/auth/login', { username, password });
            const { accessToken } = res.data;

            // 2. Lưu Token
            localStorage.setItem('token', accessToken);

            // 3. [QUAN TRỌNG] Đồng bộ thông tin User để Dashboard dùng WebSocket
            // Cách A: Nếu API Login trả về luôn thông tin User (res.data.user) -> Dùng luôn
            if (res.data.user) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/dashboard');
            } 
            // Cách B: Nếu API Login chỉ trả Token -> Gọi thêm API lấy thông tin User
            else {
                try {
                    // Gọi API lấy thông tin bản thân (Backend cần có API này, ví dụ /api/users/me)
                    // Nếu chưa có, bạn có thể tạm thời lưu username và xử lý ở Dashboard
                    // Nhưng tốt nhất là Backend nên trả về user info ngay khi login.
                    
                    // Code tạm thời: Giả lập lưu user để WebSocket không bị lỗi null
                    // (Bạn nên sửa Backend AuthController để trả về User DTO gồm walletAddress)
                    const tempUser = {
                        username: username,
                        // Lưu ý: Đây là điểm quan trọng. Nếu không lấy được ví từ Backend, 
                        // WebSocket sẽ không biết lắng nghe ở đâu.
                        // Hãy đảm bảo Backend trả về object user có walletAddress nhé!
                        walletAddress: "" // Sẽ được cập nhật nếu fetch thành công
                    };

                    // Thử gọi lấy info thật (Nếu bạn đã cài API /users/me)
                    const userRes = await axiosClient.get('/users/me'); 
                    localStorage.setItem('user', JSON.stringify(userRes.data));
                } catch (err) {
                    console.warn("Không lấy được chi tiết user, Dashboard có thể thiếu thông tin ví.");
                }
                navigate('/dashboard');
            }

        } catch (error: any) {
            alert('❌ Đăng nhập thất bại: ' + (error.response?.data?.message || 'Sai thông tin!'));
        } finally {
            setLoading(false);
        }
    };

    return (
        // Container chính với nền Gradient
        <div className="d-flex align-items-center justify-content-center min-vh-100" 
             style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            
            {/* Card Login */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" 
                 style={{ maxWidth: '450px', width: '100%', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                
                <div className="card-body p-5">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <div className="bg-primary bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow" 
                             style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                            🚀
                        </div>
                        <h3 className="fw-bold text-dark">Chào mừng trở lại!</h3>
                        <p className="text-muted small">Nhập thông tin để truy cập ví ChainPay</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        {/* Username Input */}
                        <div className="form-group mb-3">
                            <label className="form-label fw-bold small text-uppercase text-muted">Tên đăng nhập</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 rounded-start-3">
                                    <FaUser className="text-secondary" />
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-start-0 rounded-end-3 py-2"
                                    placeholder="Nhập username..."
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="form-group mb-4">
                            <label className="form-label fw-bold small text-uppercase text-muted">Mật khẩu</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 rounded-start-3">
                                    <FaLock className="text-secondary" />
                                </span>
                                <input 
                                    type="password" 
                                    className="form-control bg-light border-start-0 rounded-end-3 py-2"
                                    placeholder="Nhập password..."
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="btn btn-primary bg-gradient w-100 py-2 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 transform-scale"
                            disabled={loading}
                            style={{ transition: 'all 0.3s' }}
                        >
                            {loading ? (
                                <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                            ) : (
                                <>
                                    <FaSignInAlt /> Đăng Nhập
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="text-center mt-4 pt-3 border-top">
                        <p className="small text-muted mb-0">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-primary fw-bold text-decoration-none">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;