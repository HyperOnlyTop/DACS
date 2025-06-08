-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for phim_review2
DROP DATABASE IF EXISTS `phim_review2`;
CREATE DATABASE IF NOT EXISTS `phim_review2` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `phim_review2`;

-- Dumping structure for table phim_review2.comments
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `movie_id` int DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table phim_review2.comments: ~18 rows (approximately)
INSERT INTO `comments` (`id`, `user_id`, `movie_id`, `content`, `created_at`) VALUES
	(2, 1, 5, 'Pokemon gợi nhớ tuổi thơ. chá', '2025-05-11 11:31:18'),
	(4, 4, 8, 'wonderfull', '2025-05-12 10:47:39'),
	(5, 5, 6, 'bvc', '2025-05-12 15:15:06'),
	(6, 4, 42, 'yayy', '2025-05-13 03:54:13'),
	(10, 4, 1, '22', '2025-05-13 14:33:42'),
	(12, 5, 2, 'ada', '2025-05-13 14:37:41'),
	(13, 5, 2, 'ád', '2025-05-13 14:41:23'),
	(14, 4, 8, 'wow', '2025-05-17 12:23:19'),
	(15, 4, 42, 'as', '2025-05-17 14:56:45'),
	(16, 4, 6, 'kekeeka', '2025-05-17 17:27:19'),
	(18, 4, 29, 'abc2', '2025-05-18 08:14:39'),
	(19, 4, 1, 'heheh', '2025-05-19 11:32:17'),
	(20, 4, 3, 'ghee quaaa', '2025-05-20 10:16:14'),
	(22, 4, 1, 'a1234', '2025-05-20 17:15:26'),
	(23, 4, 9, 'oh my', '2025-05-22 14:53:53'),
	(24, 4, 57, 'như cc', '2025-05-22 15:02:33'),
	(31, 27, 6, 'phim hay tuyệt', '2025-06-03 11:59:37'),
	(35, 32, 1, 'he', '2025-06-06 06:17:47');

-- Dumping structure for table phim_review2.follows
CREATE TABLE IF NOT EXISTS `follows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `followed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`movie_id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table phim_review2.follows: ~15 rows (approximately)
INSERT INTO `follows` (`id`, `user_id`, `movie_id`, `followed_at`) VALUES
	(1, 1, 1, '2025-05-11 11:31:18'),
	(2, 1, 6, '2025-05-11 11:31:18'),
	(5, 4, 6, '2025-05-11 13:55:45'),
	(7, 4, 41, '2025-05-12 13:53:03'),
	(8, 5, 6, '2025-05-12 14:28:01'),
	(9, 5, 28, '2025-05-12 15:14:58'),
	(11, 4, 4, '2025-05-13 13:01:54'),
	(12, 4, 42, '2025-05-17 14:56:47'),
	(15, 4, 56, '2025-05-17 17:33:15'),
	(16, 4, 3, '2025-05-17 17:54:00'),
	(17, 12, 1, '2025-05-17 18:15:06'),
	(18, 4, 29, '2025-05-18 08:14:35'),
	(24, 4, 1, '2025-05-20 17:01:08'),
	(29, 4, 5, '2025-05-22 15:13:14'),
	(42, 32, 1, '2025-06-06 06:17:42');

-- Dumping structure for table phim_review2.genres
CREATE TABLE IF NOT EXISTS `genres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table phim_review2.genres: ~10 rows (approximately)
INSERT INTO `genres` (`id`, `name`) VALUES
	(1, 'Anime'),
	(8, 'Bí ẩn'),
	(9, 'Gia đình'),
	(6, 'Hài hước'),
	(2, 'Hành động'),
	(7, 'Khoa học viễn tưởng'),
	(4, 'Kinh dị'),
	(10, 'Lãng mạn'),
	(5, 'Phiêu lưu'),
	(3, 'Tình cảm');

-- Dumping structure for table phim_review2.movies
CREATE TABLE IF NOT EXISTS `movies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `year` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `description` text,
  `video_url` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `views` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table phim_review2.movies: ~36 rows (approximately)
INSERT INTO `movies` (`id`, `title`, `year`, `image_url`, `description`, `video_url`, `created_at`, `views`) VALUES
	(1, 'Thám tử lừng danh CONAN', 2023, 'https://www.fahasa.com/blog/wp-content/uploads/2025/02/conan-28-dai-dien-e1740715024411.jpeg', 'Nhóc teo nhỏ, phá án siu đỉnh', 'https://videos.pexels.com/video-files/30417207/13034772_1440_2560_30fps.mp4', '2025-05-11 11:31:18', 583),
	(2, 'Doraemon', 2023, 'https://images.fbox.fpt.vn/wordpress-blog/2023/12/hoat-hinh-dien-anh-doraemon-43.jpg', 'Nobita no Chikyuu Symphony', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 317),
	(3, 'Quỷ nhập tràng', 2023, 'https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/q/u/qu_nh_p_tr_ng_-_payoff_poster_-_kc_07032025_1_.jpg', 'Phim kinh dị', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 203),
	(4, 'Âm dương lộ', 2023, 'https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/6/4/640x396-adl_1__1.jpg', 'Phim kinh dị', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 152),
	(5, 'Pokemon', 1997, 'https://boctem.com/wp-content/uploads/2021/01/73834.jpg', 'Anime phiêu lưu', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 603),
	(6, 'Naruto Shippuden', 2007, 'https://m.media-amazon.com/images/M/MV5BNTk3MDA1ZjAtNTRhYS00YzNiLTgwOGEtYWRmYTQ3NjA0NTAwXkEyXkFqcGc@._V1_.jpg', 'Ninja báo thù, phiêu lưu hành động', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 731),
	(7, 'One Piece: Red', 2022, 'https://wafuu.com/cdn/shop/products/one-piece-film-red-special-movie-linked-edition-978102.jpg?v=1695256138', 'Cuộc phiêu lưu của Luffy và đồng đội', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 400),
	(8, 'Spirited Away', 2001, 'https://www.datocms-assets.com/56778/1736734155-spirited-away-quad.jpg?auto=format%2Ccompress&cs=srgb', 'Cô bé lạc vào thế giới linh hồn', 'https://videos.pexels.com/video-files/31961438/13618767_360_640_24fps.mp4', '2025-05-11 11:31:18', 810),
	(9, 'Attack on Titan 2', 2013, 'https://bhdstar.vn/wp-content/uploads/2025/02/referenceSchemeHeadOfficeallowPlaceHoldertrueheight700ldapp-14.jpg', 'Thế giới bị đe dọa bởi Titan khổng lồ', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 656),
	(10, 'Jujutsu Kaisen 0', 2021, 'https://cdn.europosters.eu/image/750/posters/jujutsu-kaisen-0-i111518.jpg', 'Phù thủy diệt trừ lời nguyền', 'https://media.istockphoto.com/id/2176705894/vi/video/video-m%C3%A1y-bay-kh%C3%B4ng-ng%C6%B0%E1%BB%9Di-l%C3%A1i-bay-qua-l%C3%A0ng-glynde-%E1%BB%9F-east-sussex-anh.mp4?s=mp4-640x640-is&k=20&c=_lu4VMmhfl7odkQNhCK45hpz282V8d5v3hlWGgqcQ8E=', '2025-05-11 11:31:18', 459),
	(11, 'Your Name 2', 2016, 'https://upload.wikimedia.org/wikipedia/vi/thumb/b/b3/Your_Name_novel.jpg/330px-Your_Name_novel.jpg', 'Hai con người hoán đổi thân xác qua thời gian và không gian', 'https://cdn.pixabay.com/video/2019/09/03/26493-360248645_tiny.mp4', '2025-05-11 11:31:18', 577),
	(12, 'Weathering with You', 2019, 'https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/small_image/600x314/a134659ca47b28f7b266e1777fbf870f/w/e/weathering_with_you-payoff_poster_1__1.jpg', 'Tình yêu trong cơn mưa Tokyo', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 350),
	(13, 'Howl\'s Moving Castle', 2004, 'https://images.fathomevents.com/image/upload/w_1200,dpr_2,f_auto,q_auto/v1744138088/Events/2025/2014/1000x1480_Howls_FE_Ticketing.jpg.jpg', 'Lâu đài bay kỳ bí và phù thủy', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 501),
	(14, 'My Neighbor Totoro', 1988, 'https://m.media-amazon.com/images/M/MV5BYWM3MDE3YjEtMzIzZC00ODE5LTgxNTItNmUyMTBkM2M2NmNiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 'Câu chuyện ấm áp về hai chị em và thần rừng Totoro', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 300),
	(15, 'Demon Slayer: Mugen Train', 2020, 'https://m.media-amazon.com/images/M/MV5BNzEzYjhkYTctMWNmZS00MTc5LWI4OWUtZjFkNzNkYTNkMTJlXkEyXkFqcGc@._V1_.jpg', 'Tanjiro và các trụ cột đối đầu ác quỷ trên chuyến tàu định mệnh', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 600),
	(16, 'Bleach: Thousand-Year Blood War', 2022, 'https://m.media-amazon.com/images/M/MV5BMjgyM2QzMjAtOGZjOS00OGFkLTkxZGYtMDJjZGM5MzIzYmM3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 'Cuộc chiến cuối cùng giữa Soul Society và Quincy', 'https://cdn.pixabay.com/video/2022/03/15/110879-689510470_tiny.mp4', '2025-05-11 11:31:18', 402),
	(17, 'Black Clover: Sword of the Wizard King', 2023, 'https://upload.wikimedia.org/wikipedia/en/2/21/Black_Clover_Sword_of_The_Wizard_King.jpg', 'Asta chống lại pháp sư tối thượng', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 264),
	(18, 'Chainsaw Man', 2022, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd4X6xuOj7646AfFLQiaF9KwZrjDNW3fcqkw&s', 'Thợ săn quỷ với lưỡi cưa trong người', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 351),
	(19, 'Tokyo Revenger', 2021, 'https://preview.redd.it/8ycoxjeq61y81.jpg?width=640&crop=smart&auto=webp&s=1fc673d042b2f693c3b83514d5346f8560f317d6', 'Quay ngược thời gian cứu bạn gái', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 300),
	(20, 'Dr. Stone', 2019, 'https://m.media-amazon.com/images/M/MV5BYzZkYjM1MWMtNTY3Mi00MTMzLTlhNmQtN2ExZjFkYzdjZmFjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 'Khởi động lại nền văn minh từ thời đồ đá', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 200),
	(21, 'The Promised Neverland', 2019, 'https://upload.wikimedia.org/wikipedia/vi/b/b8/Mien_dat_hua_tieng_viet.jpg', 'Trẻ em trốn chạy khỏi trại mồ côi đáng sợ', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 252),
	(22, 'Mob Psycho 100', 2016, 'https://m.media-amazon.com/images/M/MV5BYzU3NDM4ZjgtY2UyMi00YTczLTgyNDEtMjBiMDJlOGUxNjcxXkEyXkFqcGc@._V1_.jpg', 'Cậu bé siêu năng lực đối mặt với cảm xúc thật', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 400),
	(23, 'Erased', 2016, 'https://m.media-amazon.com/images/M/MV5BZWQ2YmI5NWMtZTY2Mi00MGUxLWFhMmEtYjVjZjMwOTNkOThjXkEyXkFqcGc@._V1_.jpg', 'Quay ngược thời gian để cứu mẹ và bạn học', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 350),
	(24, 'Death Parade', 2015, 'https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=contain,format=auto,quality=85,width=1200,height=675/catalog/crunchyroll/989d5abf2f9e664a84def918db260644.jpg', 'Thiên đàng hay địa ngục, quyết định sau cái chết', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 200),
	(25, 'Parasyte: The Maxim', 2014, 'https://m.media-amazon.com/images/M/MV5BMzg2YjA0NGYtYjQwMS00MDQyLWFlNWMtODVhNTBkYWIyNjE1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 'Sinh vật ngoài hành tinh ký sinh vào con người', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 300),
	(26, 'Made in Abyss', 2017, 'https://upload.wikimedia.org/wikipedia/vi/6/64/Made_in_Abyss_volume_1.jpg', 'Cuộc phiêu lưu vào vực thẳm nguy hiểm', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 250),
	(27, 'Violet Evergarden', 2018, 'https://kenh14cdn.com/203336854389633024/2020/12/7/violet-evergarden-hoi-uc-khong-quen-poster-16073595429681840339141.jpg', 'Chiến binh học cách hiểu cảm xúc con người', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 400),
	(28, 'Steins;Gate', 2011, 'https://upload.wikimedia.org/wikipedia/vi/c/ca/Steins%3BGate_anime_cover.png', 'Du hành thời gian và lý thuyết hỗn loạn', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 451),
	(29, 'Code Geass', 2006, 'https://m.media-amazon.com/images/I/714MmqMuvsL._AC_UF894,1000_QL80_.jpg', 'Hoàng tử phản loạn sở hữu sức mạnh điều khiển người khác', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 501),
	(30, 'Psycho-Pass', 2015, 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/476451eMb/anh-mo-ta.png', 'Xã hội bị kiểm soát bằng hệ thống dự đoán tội phạm', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-11 11:31:18', 350),
	(41, 'Inception', 2010, 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg', 'Một tay trộm có khả năng xâm nhập giấc mơ phải thực hiện một nhiệm vụ bất khả thi: gieo ý tưởng vào tâm trí người khác.', '/videos/inception.mp4', '2025-05-12 13:33:59', 3),
	(42, 'The Conjuring', 2013, 'https://upload.wikimedia.org/wikipedia/vi/1/1f/Conjuring_poster.jpg', 'Một cặp vợ chồng trừ tà giúp đỡ một gia đình bị ma ám trong ngôi nhà kinh hoàng.', '/videos/theconjuring.mp4', '2025-05-12 13:33:59', 2),
	(43, 'Interstellar', 2014, 'https://upload.wikimedia.org/wikipedia/vi/4/46/Interstellar_poster.jpg', 'Một nhóm nhà khoa học du hành qua lỗ sâu vũ trụ để tìm hành tinh mới cho nhân loại.', '/videos/interstellar.mp4', '2025-05-12 13:33:59', 0),
	(44, 'John Wick', 2014, 'https://m.media-amazon.com/images/M/MV5BMTU2NjA1ODgzMF5BMl5BanBnXkFtZTgwMTM2MTI4MjE@._V1_.jpg', 'Một sát thủ huyền thoại tái xuất để trả thù sau cái chết của chú chó bị giết bởi băng đảng tội phạm.', '/videos/johnwick.mp4', '2025-05-12 13:33:59', 0),
	(56, 'Dragon Ball Daima', 2025, 'https://static.minhtuanmobile.com/uploads/editer/2024-10/12/images/giai-thich-dong-thoi-gian-cua-dragon-ball-daima-4.webp', 'verry good', 'https://www.w3schools.com/html/mov_bbb.mp4', '2025-05-17 15:02:09', 63),
	(57, 'Bleach', 2025, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlKcuJp7RxxKc4b3MBt-4kI9q2rp_0u-IZ_A&s', 'Hay', 'https://drive.google.com/file/d/1VHmm5RuiW0G-d1HuynJuCHR3O7wfcPut/view?usp=sharing', '2025-05-22 14:58:58', 43);

-- Dumping structure for table phim_review2.movie_genres
CREATE TABLE IF NOT EXISTS `movie_genres` (
  `movie_id` int NOT NULL,
  `genre_id` int NOT NULL,
  PRIMARY KEY (`movie_id`,`genre_id`),
  KEY `genre_id` (`genre_id`),
  CONSTRAINT `movie_genres_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `movie_genres_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table phim_review2.movie_genres: ~96 rows (approximately)
INSERT INTO `movie_genres` (`movie_id`, `genre_id`) VALUES
	(1, 1),
	(2, 1),
	(5, 1),
	(6, 1),
	(7, 1),
	(8, 1),
	(9, 1),
	(10, 1),
	(11, 1),
	(12, 1),
	(13, 1),
	(15, 1),
	(16, 1),
	(17, 1),
	(18, 1),
	(19, 1),
	(20, 1),
	(21, 1),
	(22, 1),
	(23, 1),
	(24, 1),
	(26, 1),
	(27, 1),
	(28, 1),
	(29, 1),
	(30, 1),
	(57, 1),
	(7, 2),
	(9, 2),
	(10, 2),
	(15, 2),
	(16, 2),
	(17, 2),
	(18, 2),
	(19, 2),
	(22, 2),
	(29, 2),
	(44, 2),
	(56, 2),
	(27, 3),
	(42, 3),
	(3, 4),
	(4, 4),
	(18, 4),
	(30, 4),
	(41, 4),
	(42, 4),
	(1, 5),
	(5, 5),
	(7, 5),
	(8, 5),
	(10, 5),
	(13, 5),
	(15, 5),
	(16, 5),
	(17, 5),
	(20, 5),
	(42, 5),
	(44, 5),
	(2, 6),
	(26, 6),
	(41, 6),
	(43, 6),
	(3, 7),
	(9, 7),
	(12, 7),
	(14, 7),
	(20, 7),
	(25, 7),
	(28, 7),
	(29, 7),
	(43, 7),
	(1, 8),
	(3, 8),
	(8, 8),
	(9, 8),
	(11, 8),
	(22, 8),
	(23, 8),
	(28, 8),
	(30, 8),
	(41, 8),
	(43, 8),
	(57, 8),
	(2, 9),
	(5, 9),
	(42, 9),
	(57, 9),
	(11, 10),
	(12, 10),
	(13, 10),
	(19, 10),
	(23, 10),
	(26, 10),
	(27, 10),
	(42, 10);

-- Dumping structure for table phim_review2.ratings
CREATE TABLE IF NOT EXISTS `ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `rating` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_rating` (`user_id`,`movie_id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table phim_review2.ratings: ~18 rows (approximately)
INSERT INTO `ratings` (`id`, `user_id`, `movie_id`, `rating`, `created_at`) VALUES
	(1, 4, 1, 5, '2025-05-22 15:46:07'),
	(2, 4, 2, 3, '2025-05-19 11:13:44'),
	(3, 5, 1, 3, '2025-05-17 13:16:16'),
	(4, 4, 42, 4, '2025-05-22 12:11:17'),
	(5, 4, 17, 5, '2025-05-17 16:14:26'),
	(6, 4, 6, 5, '2025-05-17 17:27:08'),
	(7, 4, 56, 5, '2025-05-17 17:33:19'),
	(8, 12, 1, 5, '2025-05-17 18:15:11'),
	(9, 4, 29, 5, '2025-05-18 08:14:33'),
	(10, 4, 3, 5, '2025-05-20 10:15:57'),
	(11, 4, 15, 5, '2025-05-19 11:07:50'),
	(12, 4, 13, 3, '2025-05-19 11:52:56'),
	(13, 4, 9, 4, '2025-05-22 14:53:47'),
	(14, 4, 57, 5, '2025-05-22 15:02:29'),
	(15, 4, 5, 5, '2025-05-24 12:59:27'),
	(16, 4, 4, 3, '2025-05-22 16:08:58'),
	(21, 27, 6, 4, '2025-06-03 11:59:28'),
	(23, 30, 1, 5, '2025-06-03 12:17:09'),
	(24, 32, 1, 5, '2025-06-06 06:17:40');

-- Dumping structure for table phim_review2.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `reset_token` varchar(30) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table phim_review2.users: ~11 rows (approximately)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `reset_token`, `reset_expires`) VALUES
	(1, 'User1', 'user1@example.com', 'hashed_password', 'user', NULL, NULL),
	(4, 'Admin', '1@gmail.com', '$2b$10$5pSMOe4An57ujmTjanLOs.v9ceTpJK58wUE3MQwjTbb43dargAPeG', 'admin', NULL, NULL),
	(5, 'binh', 'bnhb649@gmail.com', '$2b$10$Bq3rhiFJm9xqp9J6NEqXGOE4qat6IL.rQ6OMx/KFQWeb2iQn8SurS', 'user', NULL, NULL),
	(12, '3', '44@gmail.com', '$2b$10$wQuzmI8dfSm7fBLMeGuU/O230bn5.67GG34XTEFsjk1lU4cYNSx7O', 'user', NULL, NULL),
	(16, '643', '445@gmail.com', '$2b$10$5qfhA5Nn4JxggOPwpnFkSONL1iR2ZY6tp9bjXQw2CZ/Vt8hr4/9mi', 'user', NULL, NULL),
	(18, 'acna', '3@gmail.com', '$2b$10$sP3/8cWVNpJg3Nmf2sUjZO4eAghQVRU.g8EBK.aRcLeQyH8g.S/o2', 'user', NULL, NULL),
	(21, 'acona', '4@gmail.com', '$2b$10$EAg5zoKnbv5eEdh75CWqAuQUuk9ia6QK2jFNVr8xZ7.byu2ocyC6u', 'admin', 'dfq51jkr2ug1jw0drpp1pg', '2025-05-24 14:04:09'),
	(23, 'abc', 'bnhb684@gmail.com', '$2b$10$HDYezFpPwUYnZgANzRqHDOcBTWrI6vwFD0UrIAgsiWWVONi22zZj2', 'admin', '4lhmk5y3slhbroq1nxl7pp', '2025-05-24 00:01:29'),
	(27, 'binh111', '9@gmail.com', '$2b$10$OpOd3jGG51Ec87Vt1DKZ3OXQ7DqpqVLJkU6B1vxprWEwNHCoQDTyC', 'admin', NULL, NULL),
	(30, 'binh ne', 'bnhb648@gmail.com', '$2b$10$NZFPdn2kxxbwfSKsbfbZ6OegNa0gExUSPuK6U.b04eCh0qMaDK0kG', 'user', NULL, NULL),
	(32, 'binh12221', 'an@gmail.com', '$2b$10$Ynep/R46tGNsb93YGJUS/OOEJUrjlDn.fcLKC5WkNDxC2UMgqWTCS', 'user', NULL, NULL);

-- Dumping structure for table phim_review2.watch_history
CREATE TABLE IF NOT EXISTS `watch_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `movie_id` int NOT NULL,
  `watched_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `resume_time` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `watch_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `watch_history_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table phim_review2.watch_history: ~77 rows (approximately)
INSERT INTO `watch_history` (`id`, `user_id`, `movie_id`, `watched_at`, `resume_time`) VALUES
	(1, 1, 1, '2025-05-11 11:31:18', 0),
	(2, 1, 5, '2025-05-11 11:31:18', 0),
	(3, 1, 8, '2025-05-11 11:31:18', 0),
	(6, 4, 6, '2025-05-11 13:49:29', 0),
	(7, 4, 6, '2025-05-11 14:03:53', 0),
	(8, 4, 9, '2025-05-29 13:31:37', 1),
	(9, 4, 11, '2025-05-29 13:52:22', 73),
	(10, 4, 6, '2025-05-11 14:04:37', 0),
	(11, 4, 6, '2025-05-11 14:04:58', 0),
	(12, 4, 6, '2025-05-11 14:08:38', 0),
	(13, 4, 6, '2025-05-11 14:13:05', 0),
	(14, 4, 6, '2025-05-11 14:13:06', 0),
	(15, 4, 10, '2025-05-12 11:38:56', 0),
	(24, 5, 21, '2025-05-12 15:11:24', 0),
	(26, 5, 21, '2025-05-12 15:15:17', 0),
	(31, 4, 1, '2025-05-29 14:32:42', 7),
	(33, 4, 41, '2025-05-13 03:53:48', 0),
	(34, 4, 42, '2025-05-13 03:53:59', 0),
	(35, 4, 2, '2025-05-29 13:31:43', 0),
	(38, 4, 1, '2025-05-29 14:32:42', 7),
	(39, 4, 1, '2025-05-29 14:32:42', 7),
	(40, 4, 8, '2025-05-29 13:31:34', 1),
	(41, 4, 4, '2025-05-14 11:42:45', 0),
	(42, 4, 8, '2025-05-29 13:31:34', 1),
	(43, 4, 42, '2025-05-17 14:56:49', 0),
	(46, 4, 41, '2025-05-17 17:20:41', 0),
	(47, 4, 3, '2025-05-17 17:20:50', 0),
	(48, 4, 1, '2025-05-29 14:32:42', 7),
	(49, 4, 1, '2025-05-29 14:32:42', 7),
	(50, 4, 1, '2025-05-29 14:32:42', 7),
	(51, 4, 1, '2025-05-29 14:32:42', 7),
	(52, 4, 13, '2025-05-18 09:20:08', 0),
	(53, 4, 6, '2025-05-18 09:20:45', 0),
	(54, 4, 8, '2025-05-29 13:31:34', 1),
	(55, 4, 10, '2025-05-18 09:20:52', 0),
	(56, 4, 11, '2025-05-29 13:52:22', 73),
	(57, 4, 29, '2025-05-18 09:21:01', 0),
	(58, 4, 10, '2025-05-18 10:46:53', 0),
	(59, 4, 10, '2025-05-18 10:49:44', 0),
	(60, 4, 10, '2025-05-18 10:52:32', 0),
	(61, 4, 10, '2025-05-18 10:55:52', 0),
	(62, 4, 1, '2025-05-29 14:32:42', 7),
	(63, 4, 2, '2025-05-29 13:31:43', 0),
	(64, 4, 10, '2025-05-18 11:00:09', 0),
	(65, 4, 6, '2025-05-18 11:00:53', 0),
	(66, 4, 6, '2025-05-18 11:01:21', 0),
	(67, 4, 6, '2025-05-18 11:01:44', 0),
	(68, 4, 6, '2025-05-18 11:01:48', 0),
	(69, 4, 6, '2025-05-19 11:00:28', 0),
	(70, 4, 10, '2025-05-19 11:00:31', 0),
	(71, 4, 1, '2025-05-29 14:32:42', 7),
	(72, 4, 1, '2025-05-29 14:32:42', 7),
	(73, 4, 6, '2025-05-19 11:32:31', 0),
	(74, 4, 1, '2025-05-29 14:32:42', 7),
	(75, 4, 1, '2025-05-29 14:32:42', 7),
	(76, 4, 1, '2025-05-29 14:32:42', 7),
	(77, 4, 1, '2025-05-29 14:32:42', 7),
	(79, 4, 3, '2025-05-20 10:23:35', 0),
	(80, 4, 6, '2025-05-20 17:00:33', 0),
	(81, 4, 1, '2025-05-29 14:32:42', 7),
	(89, 4, 56, '2025-06-02 11:37:15', 3),
	(90, 4, 57, '2025-05-22 17:45:13', 0),
	(91, 4, 57, '2025-05-22 17:45:16', 0),
	(92, 4, 56, '2025-06-02 11:37:15', 3),
	(93, 4, 56, '2025-06-02 11:37:15', 3),
	(94, 4, 41, '2025-05-23 07:34:21', 0),
	(95, 4, 5, '2025-05-23 07:34:57', 0),
	(96, 4, 1, '2025-05-29 14:32:42', 7),
	(97, 4, 1, '2025-05-29 14:32:42', 7),
	(98, 4, 1, '2025-05-29 14:32:42', 7),
	(99, 4, 1, '2025-05-29 14:32:42', 7),
	(100, 4, 1, '2025-05-29 14:32:42', 7),
	(101, 4, 5, '2025-05-23 10:20:37', 0),
	(105, 4, 5, '2025-05-24 12:59:15', 0),
	(106, 4, 2, '2025-05-29 13:31:43', 0),
	(114, 4, 16, '2025-05-29 13:31:41', 1),
	(121, 32, 1, '2025-06-06 06:17:58', 3);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
