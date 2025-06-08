const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'public')));


// ================== KẾT NỐI MYSQL ==================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'phim_review2',
});

db.connect((err) => {
    if (err) {
        console.error('❌ Lỗi kết nối MySQL:', err.message);
        process.exit(1);
    }
    console.log('✅ Đã kết nối MySQL');
});

// ================== CẤU HÌNH GỬI EMAIL ==================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rphim301@gmail.com', 
        pass: 'xzow afiq jevf gess'     
    }
});

// ================== MIDDLEWARE PHÂN QUYỀN ADMIN ==================
const verifyAdmin = (req, res, next) => {
    const requesterEmail = req.body.email || req.body.requesterEmail;

    if (!requesterEmail) {
        return res.status(400).json({ message: 'Thiếu email người yêu cầu!' });
    }

    const roleCheckSql = 'SELECT role FROM users WHERE email = ?';
    db.query(roleCheckSql, [requesterEmail], (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi kiểm tra quyền!' });

        if (results.length === 0 || results[0].role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập!' });
        }

        next();
    });
};

// ================== ĐĂNG KÝ ==================
app.post('/api/register', (req, res) => {
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
    }

    const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailSql, [email], (checkErr, results) => {
        if (checkErr) {
            return res.status(500).json({ message: 'Lỗi kiểm tra email!' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Email đã tồn tại!' });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: 'Lỗi mã hóa mật khẩu!' });

            const insertUserSql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
            db.query(insertUserSql, [name, email, hashedPassword, role], (insertErr) => {
                if (insertErr) {
                    return res.status(500).json({ message: 'Lỗi khi đăng ký!' });
                }
                res.status(201).json({ message: 'Đăng ký thành công!' });
            });
        });
    });
});

// ================== ĐĂNG NHẬP ==================
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu!' });
    }

    const loginSql = 'SELECT id, name, email, password, role FROM users WHERE email = ?';
    db.query(loginSql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Lỗi server!' });
        }
        if (results.length > 0) {
            const user = results[0];
            bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
                if (bcryptErr) {
                    return res.status(500).json({ success: false, message: 'Lỗi xác thực mật khẩu!' });
                }
                if (isMatch) {
                    res.status(200).json({
                        success: true,
                        message: 'Đăng nhập thành công!',
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        }
                    });
                } else {
                    res.status(401).json({ success: false, message: 'Sai mật khẩu!' });
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Email không tồn tại!' });
        }
    });
});

// ================== QUÊN MẬT KHẨU ==================
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Vui lòng nhập email!' });
    }

    const checkUserSql = 'SELECT id, email FROM users WHERE email = ?';
    db.query(checkUserSql, [email], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra email:', err);
            return res.status(500).json({ message: 'Lỗi server khi kiểm tra email!' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Email không tồn tại!' });
        }

        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetExpires = new Date(Date.now() + 3600000); // 1 tiếng hết hạn

        const updateTokenSql = 'UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?';
        db.query(updateTokenSql, [resetToken, resetExpires, email], (err) => {
            if (err) {
                console.error('Lỗi lưu token:', err);
                return res.status(500).json({ message: 'Lỗi lưu thông tin khôi phục!' });
            }

            const resetLink = `http://localhost:3000/reset-password.html?token=${resetToken}`;
            const mailOptions = {
                from: 'rphim301@gmail.com',
                to: email,
                subject: 'Khôi phục mật khẩu',
                text: `Nhấn vào liên kết sau để đặt lại mật khẩu: ${resetLink}\nLiên kết sẽ hết hạn sau 1 giờ.`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Lỗi gửi email:', error); 
                    return res.status(500).json({ message: 'Lỗi gửi email khôi phục!' });
                }
                console.log('Email gửi thành công:', info.response);
                res.json({ message: 'Đã gửi email khôi phục!' });
            });
        });
    });
});

// ================== ĐẶT LẠI MẬT KHẨU ==================
app.post('/api/reset-password', (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Thiếu token hoặc mật khẩu!' });
    }

    const checkTokenSql = 'SELECT id, email, reset_expires FROM users WHERE reset_token = ?';
    db.query(checkTokenSql, [token], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra token:', err);
            return res.status(500).json({ message: 'Lỗi server!' });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'Token không hợp lệ!' });
        }

        const user = results[0];
        if (new Date() > new Date(user.reset_expires)) {
            return res.status(400).json({ message: 'Token đã hết hạn!' });
        }

        bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
                return res.status(500).json({ message: 'Lỗi mã hóa mật khẩu!' });
            }

            const updatePasswordSql = 'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?';
            db.query(updatePasswordSql, [hashedPassword, token], (updateErr) => {
                if (updateErr) {
                    console.error('Lỗi cập nhật mật khẩu:', updateErr);
                    return res.status(500).json({ message: 'Lỗi cập nhật mật khẩu!' });
                }
                res.json({ message: 'Mật khẩu đã được cập nhật!' });
            });
        });
    });
});

// ================== LẤY DANH SÁCH USER (Admin) ==================
app.post('/api/all-users', verifyAdmin, (req, res) => {
    const getAllSql = 'SELECT id, name, email, role FROM users';
    db.query(getAllSql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn user!' });
        res.json({ users: results });
    });
});

// ================== XÓA USER (Admin-only) ==================
app.delete('/api/delete-user/:id', verifyAdmin, (req, res) => {
    const userId = req.params.id;

    const checkUserSql = 'SELECT id FROM users WHERE id = ?';
    db.query(checkUserSql, [userId], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra người dùng:', err);
            return res.status(500).json({ message: 'Lỗi kiểm tra người dùng!' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa!' });
        }

        const deleteWatchHistorySql = 'DELETE FROM watch_history WHERE user_id = ?';
        db.query(deleteWatchHistorySql, [userId], (err) => {
            if (err) {
                console.error('Lỗi xóa lịch sử xem:', err);
                return res.status(500).json({ message: 'Lỗi xóa lịch sử xem!' });
            }

            const deleteFollowsSql = 'DELETE FROM follows WHERE user_id = ?';
            db.query(deleteFollowsSql, [userId], (err) => {
                if (err) {
                    console.error('Lỗi xóa danh sách theo dõi:', err);
                    return res.status(500).json({ message: 'Lỗi xóa danh sách theo dõi!' });
                }

                const deleteCommentsSql = 'DELETE FROM comments WHERE user_id = ?';
                db.query(deleteCommentsSql, [userId], (err) => {
                    if (err) {
                        console.error('Lỗi xóa bình luận:', err);
                        return res.status(500).json({ message: 'Lỗi xóa bình luận!' });
                    }

                    const deleteUserSql = 'DELETE FROM users WHERE id = ?';
                    db.query(deleteUserSql, [userId], (err, result) => {
                        if (err) {
                            console.error('Lỗi xóa người dùng:', err);
                            return res.status(500).json({ message: 'Lỗi xóa người dùng!' });
                        }
                        res.json({ message: 'Đã xóa người dùng và dữ liệu liên quan thành công!' });
                    });
                });
            });
        });
    });
});

// ================== SỬA USER (Admin-only) ==================
app.put('/api/update-user/:id', verifyAdmin, (req, res) => {
    const userId = req.params.id;
    const { name, email, password, role, requesterEmail } = req.body;
    console.log('Yêu cầu cập nhật người dùng:', { userId, name, email, password, role, requesterEmail });

    if (!name || !role) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên và vai trò!' });
    }

    const checkUserSql = 'SELECT email FROM users WHERE id = ?';
    db.query(checkUserSql, [userId], (checkErr, userResults) => {
        if (checkErr) {
            console.error('Lỗi kiểm tra người dùng:', checkErr);
            return res.status(500).json({ message: 'Lỗi kiểm tra người dùng!' });
        }
        if (userResults.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        const currentEmail = userResults[0].email;

        const updateFields = { name, role };
        if (email && email !== currentEmail) {
            updateFields.email = email;
        }

        let updateSql = 'UPDATE users SET name = ?, role = ? WHERE id = ?';
        let params = [updateFields.name, updateFields.role, userId];

        if (password) {
            bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
                if (hashErr) {
                    return res.status(500).json({ message: 'Lỗi mã hóa mật khẩu!' });
                }
                updateSql = 'UPDATE users SET name = ?, role = ?, password = ? WHERE id = ?';
                params = [updateFields.name, updateFields.role, hashedPassword, userId];
                if (email && email !== currentEmail) {
                    updateSql = 'UPDATE users SET name = ?, role = ?, password = ?, email = ? WHERE id = ?';
                    params = [updateFields.name, updateFields.role, hashedPassword, email, userId];
                }
                db.query(updateSql, params, (updateErr, result) => {
                    if (updateErr) {
                        console.error('Lỗi cập nhật người dùng:', updateErr);
                        return res.status(500).json({ message: 'Cập nhật người dùng thất bại!' });
                    }
                    res.json({ message: 'Cập nhật thông tin người dùng thành công!' });
                });
            });
        } else {
            if (email && email !== currentEmail) {
                updateSql = 'UPDATE users SET name = ?, role = ?, email = ? WHERE id = ?';
                params = [updateFields.name, updateFields.role, email, userId];
            }
            db.query(updateSql, params, (updateErr, result) => {
                if (updateErr) {
                    console.error('Lỗi cập nhật người dùng:', updateErr);
                    return res.status(500).json({ message: 'Cập nhật người dùng thất bại!' });
                }
                res.json({ message: 'Cập nhật thông tin người dùng thành công!' });
            });
        }
    });
});

// ================== CẬP NHẬT THÔNG TIN CÁ NHÂN ==================
app.put('/api/update-profile/:id', (req, res) => {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên và email!' });
    }

    const checkUserSql = 'SELECT * FROM users WHERE id = ?';
    db.query(checkUserSql, [userId], (checkErr, results) => {
        if (checkErr) {
            return res.status(500).json({ message: 'Lỗi kiểm tra người dùng!' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật!' });
        }

        const checkEmailSql = 'SELECT * FROM users WHERE email = ? AND id != ?';
        db.query(checkEmailSql, [email, userId], (emailErr, emailResults) => {
            if (emailErr) {
                return res.status(500).json({ message: 'Lỗi kiểm tra email!' });
            }
            if (emailResults.length > 0) {
                return res.status(400).json({ message: 'Email đã được sử dụng bởi người dùng khác!' });
            }

            if (password) {
                bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
                    if (hashErr) {
                        return res.status(500).json({ message: 'Lỗi mã hóa mật khẩu!' });
                    }

                    const updateSql = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
                    db.query(updateSql, [name, email, hashedPassword, userId], (updateErr, result) => {
                        if (updateErr) {
                            return res.status(500).json({ message: 'Cập nhật thất bại!' });
                        }
                        res.json({
                            message: 'Cập nhật thông tin và mật khẩu thành công!',
                            updatedUser: { id: userId, name, email }
                        });
                    });
                });
            } else {
                const updateSql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
                db.query(updateSql, [name, email, userId], (updateErr, result) => {
                    if (updateErr) {
                        return res.status(500).json({ message: 'Cập nhật thất bại!' });
                    }
                    res.json({
                        message: 'Cập nhật thông tin thành công!',
                        updatedUser: { id: userId, name, email }
                    });
                });
            }
        });
    });
});

// ================== LẤY DANH SÁCH PHIM ==================
app.get('/api/movies', (req, res) => {
    const { genre_id, search } = req.query;

    if (genre_id && isNaN(genre_id)) {
        return res.status(400).json({ message: 'genre_id không hợp lệ!' });
    }

    if (genre_id) {
        const checkGenreSql = 'SELECT id FROM genres WHERE id = ?';
        db.query(checkGenreSql, [genre_id], (err, results) => {
            if (err) {
                console.error('Lỗi kiểm tra thể loại:', err);
                return res.status(500).json({ message: 'Lỗi kiểm tra thể loại!' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Thể loại không tồn tại!' });
            }

            let sql = `
                SELECT m.*
                FROM movies m
                INNER JOIN movie_genres mg ON m.id = mg.movie_id
                WHERE mg.genre_id = ?
            `;
            const params = [genre_id];

            if (search) {
                sql += ' AND m.title LIKE ?';
                params.push(`%${search}%`);
            }

            sql += ' ORDER BY m.views DESC';

            db.query(sql, params, (err, results) => {
                if (err) {
                    console.error('Lỗi truy vấn phim:', err);
                    return res.status(500).json({ message: 'Lỗi lấy danh sách phim!' });
                }
                res.json(results);
            });
        });
    } else {
        let sql = 'SELECT * FROM movies WHERE 1=1';
        const params = [];

        if (search) {
            sql += ' AND title LIKE ?';
            params.push(`%${search}%`);
        }

        sql += ' ORDER BY views DESC';

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Lỗi truy vấn phim:', err);
                return res.status(500).json({ message: 'Lỗi lấy danh sách phim!' });
            }
            res.json(results);
        });
    }
});

// ================== TÌM KIẾM PHIM ==================
app.get('/api/movies/search', (req, res) => {
    const { keyword } = req.query;
    const sql = 'SELECT * FROM movies WHERE title LIKE ?';
    db.query(sql, [`%${keyword}%`], (err, results) => {
        if (err) {
            console.error('Lỗi tìm kiếm phim:', err);
            return res.status(500).json({ message: 'Lỗi server!' });
        }
        res.json(results);
    });
});

// ================== LẤY THÔNG TIN PHIM THEO ID ==================
app.get('/api/getMovie', (req, res) => {
    const movieId = req.query.id;
    if (!movieId) {
        return res.status(400).json({ message: 'Thiếu ID phim!' });
    }

    const sql = `
        SELECT m.*, GROUP_CONCAT(g.name) as genres, GROUP_CONCAT(mg.genre_id) as genre_ids
        FROM movies m
        LEFT JOIN movie_genres mg ON m.id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        WHERE m.id = ?
        GROUP BY m.id
    `;
    db.query(sql, [movieId], (error, results) => {
        if (error) {
            console.error('Lỗi truy vấn phim:', error);
            return res.status(500).json({ message: 'Lỗi server!' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim!' });
        }
        results[0].genres = results[0].genres ? results[0].genres.split(',') : [];
        results[0].genre_ids = results[0].genre_ids ? results[0].genre_ids.split(',').map(Number) : [];
        res.json(results[0]);
    });
});

// ================== THÊM PHIM MỚI (Admin-only) ==================
app.post('/api/movies', verifyAdmin, (req, res) => {
    const { title, year, description, image_url, video_url, genre_ids, email } = req.body;

    if (!title || !year || !Array.isArray(genre_ids) || genre_ids.length === 0) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ tiêu đề, năm sản xuất và ít nhất một thể loại!' });
    }

    const checkGenreSql = 'SELECT id FROM genres WHERE id IN (?)';
    db.query(checkGenreSql, [genre_ids], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra thể loại:', err);
            return res.status(500).json({ message: 'Lỗi kiểm tra thể loại!' });
        }
        const validGenreIds = results.map(row => row.id);
        if (validGenreIds.length !== genre_ids.length) {
            return res.status(404).json({ message: 'Một hoặc nhiều thể loại không tồn tại!' });
        }

        const insertMovieSql = `
            INSERT INTO movies (title, year, description, image_url, video_url, views)
            VALUES (?, ?, ?, ?, ?, 0)
        `;
        db.query(insertMovieSql, [title, year, description || null, image_url || null, video_url || null], (err, result) => {
            if (err) {
                console.error('Lỗi thêm phim:', err);
                return res.status(500).json({ message: 'Lỗi thêm phim!' });
            }

            const movieId = result.insertId;

            const insertMovieGenreSql = 'INSERT INTO movie_genres (movie_id, genre_id) VALUES ?';
            const genreValues = genre_ids.map(genre_id => [movieId, genre_id]);
            db.query(insertMovieGenreSql, [genreValues], (err) => {
                if (err) {
                    console.error('Lỗi thêm thể loại phim:', err);
                    return res.status(500).json({ message: 'Lỗi thêm thể loại phim!' });
                }
                res.status(201).json({ message: 'Thêm phim thành công!', movieId });
            });
        });
    });
});

// ================== SỬA PHIM (Admin-only) ==================
app.put('/api/movies/:id', verifyAdmin, (req, res) => {
    const movieId = req.params.id;
    const { title, year, description, image_url, video_url, genre_ids, email } = req.body;

    if (!title || !year || !Array.isArray(genre_ids) || genre_ids.length === 0) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ tiêu đề, năm sản xuất và ít nhất một thể loại!' });
    }

    const checkMovieSql = 'SELECT id FROM movies WHERE id = ?';
    db.query(checkMovieSql, [movieId], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra phim:', err);
            return res.status(500).json({ message: 'Lỗi kiểm tra phim!' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim!' });
        }

        const checkGenreSql = 'SELECT id FROM genres WHERE id IN (?)';
        db.query(checkGenreSql, [genre_ids], (err, results) => {
            if (err) {
                console.error('Lỗi kiểm tra thể loại:', err);
                return res.status(500).json({ message: 'Lỗi kiểm tra thể loại!' });
            }
            const validGenreIds = results.map(row => row.id);
            if (validGenreIds.length !== genre_ids.length) {
                return res.status(404).json({ message: 'Một hoặc nhiều thể loại không tồn tại!' });
            }

            const updateMovieSql = `
                UPDATE movies
                SET title = ?, year = ?, description = ?, image_url = ?, video_url = ?
                WHERE id = ?
            `;
            db.query(updateMovieSql, [title, year, description || null, image_url || null, video_url || null, movieId], (err) => {
                if (err) {
                    console.error('Lỗi cập nhật phim:', err);
                    return res.status(500).json({ message: 'Lỗi cập nhật phim!' });
                }

                const deleteMovieGenreSql = 'DELETE FROM movie_genres WHERE movie_id = ?';
                db.query(deleteMovieGenreSql, [movieId], (err) => {
                    if (err) {
                        console.error('Lỗi xóa thể loại cũ:', err);
                        return res.status(500).json({ message: 'Lỗi xóa thể loại cũ!' });
                    }

                    const insertMovieGenreSql = 'INSERT INTO movie_genres (movie_id, genre_id) VALUES ?';
                    const genreValues = genre_ids.map(genre_id => [movieId, genre_id]);
                    db.query(insertMovieGenreSql, [genreValues], (err) => {
                        if (err) {
                            console.error('Lỗi thêm thể loại mới:', err);
                            return res.status(500).json({ message: 'Lỗi thêm thể loại mới!' });
                        }
                        res.json({ message: 'Sửa phim thành công!' });
                    });
                });
            });
        });
    });
});

// ================== XÓA PHIM (Admin-only) ==================
app.delete('/api/movies/:id', verifyAdmin, (req, res) => {
    const movieId = req.params.id;

    const checkMovieSql = 'SELECT id FROM movies WHERE id = ?';
    db.query(checkMovieSql, [movieId], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra phim:', err);
            return res.status(500).json({ message: 'Lỗi kiểm tra phim!' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim!' });
        }

        const deleteMovieGenreSql = 'DELETE FROM movie_genres WHERE movie_id = ?';
        db.query(deleteMovieGenreSql, [movieId], (err) => {
            if (err) {
                console.error('Lỗi xóa thể loại phim:', err);
                return res.status(500).json({ message: 'Lỗi xóa thể loại phim!' });
            }

            const deleteMovieSql = 'DELETE FROM movies WHERE id = ?';
            db.query(deleteMovieSql, [movieId], (err) => {
                if (err) {
                    console.error('Lỗi xóa phim:', err);
                    return res.status(500).json({ message: 'Lỗi xóa phim!' });
                }
                res.json({ message: 'Xóa phim thành công!' });
            });
        });
    });
});

// ================== TĂNG LƯỢT XEM ==================
app.post('/api/increment-views/:id', (req, res) => {
    const movieId = req.params.id;
    const sql = 'UPDATE movies SET views = views + 1 WHERE id = ?';
    db.query(sql, [movieId], (err, result) => {
        if (err) {
            console.error('Lỗi cập nhật lượt xem:', err);
            return res.status(500).json({ message: 'Lỗi cập nhật lượt xem!' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim!' });
        }
        res.json({ message: 'Đã tăng lượt xem!' });
    });
});

// ================== LƯU LỊCH SỬ XEM ==================
app.post('/api/watch-history', (req, res) => {
    const { user_id, movie_id, resume_time = 0 } = req.body;
    if (!user_id || !movie_id) {
        return res.status(400).json({ message: 'Thiếu user_id hoặc movie_id!' });
    }

    // Kiểm tra xem bản ghi đã tồn tại chưa
    const checkSql = 'SELECT id FROM watch_history WHERE user_id = ? AND movie_id = ?';
    db.query(checkSql, [user_id, movie_id], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra lịch sử xem:', err);
            return res.status(500).json({ message: 'Lỗi kiểm tra lịch sử xem!' });
        }

        if (results.length > 0) {
            // Cập nhật resume_time nếu bản ghi đã tồn tại
            const updateSql = 'UPDATE watch_history SET resume_time = ?, watched_at = NOW() WHERE user_id = ? AND movie_id = ?';
            db.query(updateSql, [resume_time, user_id, movie_id], (err) => {
                if (err) {
                    console.error('Lỗi cập nhật lịch sử xem:', err);
                    return res.status(500).json({ message: 'Lỗi cập nhật lịch sử xem!' });
                }
                res.json({ message: 'Đã cập nhật lịch sử xem!' });
            });
        } else {
            // Thêm mới bản ghi
            const insertSql = 'INSERT INTO watch_history (user_id, movie_id, resume_time) VALUES (?, ?, ?)';
            db.query(insertSql, [user_id, movie_id, resume_time], (err) => {
                if (err) {
                    console.error('Lỗi lưu lịch sử xem:', err);
                    return res.status(500).json({ message: 'Lỗi lưu lịch sử xem!' });
                }
                res.json({ message: 'Đã lưu lịch sử xem!' });
            });
        }
    });
});

// ================== LẤY LỊCH SỬ XEM ==================
app.get('/api/watch-history/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT m.*, wh.watched_at, wh.resume_time 
        FROM watch_history wh 
        JOIN movies m ON wh.movie_id = m.id 
        WHERE wh.user_id = ? 
        ORDER BY wh.watched_at DESC
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Lỗi lấy lịch sử xem:', err);
            return res.status(500).json({ message: 'Lỗi lấy lịch sử xem!' });
        }
        res.json(results);
    });
});

// Xóa lịch sử xem một phim
app.delete('/api/watch-history', (req, res) => {
    const { user_id, movie_id } = req.body;
    if (!user_id || !movie_id) {
        return res.status(400).json({ message: 'Thiếu user_id hoặc movie_id!' });
    }
    const sql = 'DELETE FROM watch_history WHERE user_id = ? AND movie_id = ?';
    db.query(sql, [user_id, movie_id], (err, result) => {
        if (err) {
            console.error('Lỗi xóa lịch sử xem:', err);
            return res.status(500).json({ message: 'Lỗi xóa lịch sử xem!' });
        }
        res.json({ message: 'Đã xóa lịch sử xem!' });
    });
});

// ================== THEO DÕI PHIM ==================
app.post('/api/follow', (req, res) => {
    const { user_id, movie_id } = req.body;

    if (!user_id || !movie_id) {
        return res.status(400).json({ success: false, message: 'Thiếu user_id hoặc movie_id!' });
    }

    const sql = 'INSERT INTO follows (user_id, movie_id) VALUES (?, ?)';
    db.query(sql, [user_id, movie_id], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Bạn đã theo dõi phim này!' });
            }
            console.error('Lỗi theo dõi phim:', err);
            return res.status(500).json({ success: false, message: 'Lỗi theo dõi phim!' });
        }
        res.json({ success: true, message: 'Đã theo dõi phim!' });
    });
});

// ================== BỎ THEO DÕI PHIM ==================
app.delete('/api/unfollow', (req, res) => {
    const { user_id, movie_id } = req.body;

    if (!user_id || !movie_id) {
        return res.status(400).json({ success: false, message: 'Thiếu user_id hoặc movie_id!' });
    }

    const sql = 'DELETE FROM follows WHERE user_id = ? AND movie_id = ?';
    db.query(sql, [user_id, movie_id], (err, result) => {
        if (err) {
            console.error('Lỗi bỏ theo dõi phim:', err);
            return res.status(500).json({ success: false, message: 'Lỗi bỏ theo dõi phim!' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phim trong danh sách theo dõi!' });
        }
        res.json({ success: true, message: 'Đã bỏ theo dõi phim!' });
    });
});

// ================== LẤY DANH SÁCH PHIM THEO DÕI ==================
app.get('/api/follows/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = `
        SELECT m.*, f.followed_at 
        FROM follows f 
        JOIN movies m ON f.movie_id = m.id 
        WHERE f.user_id = ? 
        ORDER BY f.followed_at DESC
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Lỗi lấy danh sách theo dõi:', err);
            return res.status(500).json({ success: false, message: 'Lỗi lấy danh sách theo dõi!' });
        }
        res.json(results);
    });
});

// ================== LẤY BẢNG XẾP HẠNG PHIM ==================
app.get('/api/ranking', (req, res) => {
    const sql = 'SELECT * FROM movies ORDER BY views DESC LIMIT 100';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi lấy bảng xếp hạng:', err);
            return res.status(500).json({ message: 'Lỗi server!' });
        }
        res.json(results);
    });
});

// ================== LẤY DANH SÁCH THỂ LOẠI ==================
app.get('/api/genres', (req, res) => {
    const sql = 'SELECT id, name FROM genres ORDER BY name';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi lấy thể loại!' });
        res.json(results);
    });
});

// ================== LẤY BÌNH LUẬN THEO PHIM ==================
app.get('/api/comments/:movieId', (req, res) => {
    const movieId = req.params.movieId;
    const sql = `
        SELECT c.id, c.content, c.created_at, c.user_id, u.name AS user_name
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.movie_id = ?
        ORDER BY c.created_at DESC
    `;
    db.query(sql, [movieId], (err, results) => {
        if (err) {
            console.error('Lỗi lấy bình luận:', err);
            return res.status(500).json({ message: 'Lỗi server!' });
        }
        res.json(results);
    });
});

// ================== LƯU BÌNH LUẬN ==================
app.post('/api/comments', (req, res) => {
    const { user_id, movie_id, content } = req.body;

    if (!user_id || !movie_id || !content) {
        return res.status(400).json({ message: 'Thiếu user_id, movie_id hoặc nội dung bình luận!' });
    }

    const sql = 'INSERT INTO comments (user_id, movie_id, content) VALUES (?, ?, ?)';
    db.query(sql, [user_id, movie_id, content], (err, result) => {
        if (err) {
            console.error('Lỗi lưu bình luận:', err);
            return res.status(500).json({ message: 'Lỗi lưu bình luận!' });
        }
        res.json({ message: 'Bình luận đã được lưu!' });
    });
});

// ================== SỬA BÌNH LUẬN ==================
app.put('/api/comments/:id', (req, res) => {
    const commentId = req.params.id;
    const { user_id, content, role } = req.body;

    if (!user_id || !content) {
        return res.status(400).json({ message: 'Thiếu user_id hoặc nội dung!' });
    }

    const checkSql = 'SELECT user_id FROM comments WHERE id = ?';
    db.query(checkSql, [commentId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi kiểm tra bình luận!' });
        if (results.length === 0) return res.status(404).json({ message: 'Không tìm thấy bình luận!' });

        if (role !== 'admin' && results[0].user_id != user_id) {
            return res.status(403).json({ message: 'Bạn không có quyền sửa bình luận này!' });
        }

        const updateSql = 'UPDATE comments SET content = ? WHERE id = ?';
        db.query(updateSql, [content, commentId], (err) => {
            if (err) return res.status(500).json({ message: 'Lỗi sửa bình luận!' });
            res.json({ message: 'Đã sửa bình luận!' });
        });
    });
});


// ================== XÓA BÌNH LUẬN ==================
app.delete('/api/comments/:id', (req, res) => {
    const commentId = req.params.id;
    const { user_id, role } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: 'Thiếu user_id!' });
    }

    const checkSql = 'SELECT user_id FROM comments WHERE id = ?';
    db.query(checkSql, [commentId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi kiểm tra bình luận!' });
        if (results.length === 0) return res.status(404).json({ message: 'Không tìm thấy bình luận!' });

        if (role !== 'admin' && results[0].user_id != user_id) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này!' });
        }

        const deleteSql = 'DELETE FROM comments WHERE id = ?';
        db.query(deleteSql, [commentId], (err) => {
            if (err) return res.status(500).json({ message: 'Lỗi xóa bình luận!' });
            res.json({ message: 'Đã xóa bình luận!' });
        });
    });
});


// ================== GỬI ĐÁNH GIÁ PHIM ==================
app.post('/api/ratings', (req, res) => {
    const { user_id, movie_id, rating } = req.body;

    if (!user_id || !movie_id || !rating) {
        return res.status(400).json({ message: 'Thiếu user_id, movie_id hoặc rating!' });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating phải là số nguyên từ 1 đến 5!' });
    }

    const checkRatingSql = 'SELECT id FROM ratings WHERE user_id = ? AND movie_id = ?';
    db.query(checkRatingSql, [user_id, movie_id], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra đánh giá:', err);
            return res.status(500).json({ message: 'Lỗi kiểm tra đánh giá!' });
        }

        if (results.length > 0) {
            const updateRatingSql = 'UPDATE ratings SET rating = ?, created_at = NOW() WHERE user_id = ? AND movie_id = ?';
            db.query(updateRatingSql, [rating, user_id, movie_id], (err) => {
                if (err) {
                    console.error('Lỗi cập nhật đánh giá:', err);
                    return res.status(500).json({ message: 'Lỗi cập nhật đánh giá!' });
                }
                res.json({ message: 'Đã cập nhật đánh giá!' });
            });
        } else {

            const insertRatingSql = 'INSERT INTO ratings (user_id, movie_id, rating) VALUES (?, ?, ?)';
            db.query(insertRatingSql, [user_id, movie_id, rating], (err) => {
                if (err) {
                    console.error('Lỗi lưu đánh giá:', err);
                    return res.status(500).json({ message: 'Lỗi lưu đánh giá!' });
                }
                res.json({ message: 'Đã lưu đánh giá!' });
            });
        }
    });
});


// ================== LẤY ĐÁNH GIÁ CỦA NGƯỜI DÙNG VÀ TRUNG BÌNH ==================
app.get('/api/ratings/:movieId', (req, res) => {
    const movieId = req.params.movieId;
    const userId = req.query.user_id;

    const avgRatingSql = `
        SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings
        FROM ratings
        WHERE movie_id = ?
    `;
    db.query(avgRatingSql, [movieId], (err, avgResults) => {
        if (err) {
            console.error('Lỗi lấy đánh giá trung bình:', err);
            return res.status(500).json({ message: 'Lỗi lấy đánh giá trung bình!' });
        }

        const response = {
            average_rating: avgResults[0].average_rating ? parseFloat(avgResults[0].average_rating).toFixed(1) : 0,
            total_ratings: avgResults[0].total_ratings
        };

        if (userId) {
            const userRatingSql = 'SELECT rating FROM ratings WHERE user_id = ? AND movie_id = ?';
            db.query(userRatingSql, [userId, movieId], (err, userResults) => {
                if (err) {
                    console.error('Lỗi lấy đánh giá người dùng:', err);
                    return res.status(500).json({ message: 'Lỗi lấy đánh giá người dùng!' });
                }
                response.user_rating = userResults.length > 0 ? userResults[0].rating : null;
                res.json(response);
            });
        } else {
            res.json(response);
        }
    });
});

// ================== XỬ LÝ LỖI TOÀN CỤC ==================
app.use((err, req, res, next) => {
    console.error('Lỗi không xử lý được:', err.stack);
    res.status(500).json({ message: 'Lỗi server nội bộ!' });
});

// ================== CHẠY SERVER ==================
app.listen(3000, () => {
    console.log('🚀 Server chạy tại http://localhost:3000');
});