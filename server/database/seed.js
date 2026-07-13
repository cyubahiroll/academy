const db = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  try {
    const hash = bcrypt.hashSync('admin123', 10);

    await db.query("DELETE FROM free_test_answers");
    await db.query("DELETE FROM free_test_attempts");
    await db.query("DELETE FROM free_test_questions");
    await db.query("DELETE FROM document_purchases");
    await db.query("DELETE FROM ai_chat_messages");
    await db.query("DELETE FROM activity_logs");
    await db.query("DELETE FROM leaderboard");
    await db.query("DELETE FROM payments");
    await db.query("DELETE FROM subscriptions");
    await db.query("DELETE FROM exam_results");
    await db.query("DELETE FROM quiz_results");
    await db.query("DELETE FROM exam_questions");
    await db.query("DELETE FROM questions");
    await db.query("DELETE FROM quizzes");
    await db.query("DELETE FROM exams");
    await db.query("DELETE FROM documents");
    await db.query("DELETE FROM videos");
    await db.query("DELETE FROM team_members");
    await db.query("DELETE FROM categories");
    await db.query("DELETE FROM certificates");
    await db.query("DELETE FROM users");

    await db.query("ALTER TABLE users AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE categories AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE quizzes AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE questions AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE exams AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE exam_questions AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE subscriptions AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE payments AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE leaderboard AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE documents AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE videos AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE free_test_questions AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE document_purchases AUTO_INCREMENT = 1");
    await db.query("ALTER TABLE team_members AUTO_INCREMENT = 1");

    await db.query(
      'INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
      ['Admin User', 'admin@roadrules.com', hash, '+256700000000', 'admin',
       'John Doe', 'john@example.com', hash, '+256700000001', 'user']
    );

    await db.query(
      'INSERT INTO categories (name, slug, description, icon) VALUES ?',
      [[
        ['Road Signs', 'road-signs', 'Learn about regulatory, warning, and guide signs', 'road_signs_icon.png'],
        ['Traffic Rules', 'traffic-rules', 'Comprehensive traffic rules and regulations', 'traffic_rules_icon.png'],
        ['Defensive Driving', 'defensive-driving', 'Defensive driving techniques and safety', 'defensive_driving_icon.png'],
        ['Parking Rules', 'parking-rules', 'Parking regulations and restrictions', 'parking_rules_icon.png'],
        ['Speed Limits', 'speed-limits', 'Speed limit regulations by road type', 'speed_limits_icon.png'],
        ['Alcohol & Drugs', 'alcohol-drugs', 'DUI laws and substance abuse awareness', 'alcohol_drugs_icon.png']
      ]]
    );

    await db.query(
      'INSERT INTO quizzes (title, description, category_id, difficulty, pass_score, time_limit, is_free, attempt_limit) VALUES ?',
      [[
        ['Road Signs Basics', 'Test your knowledge of common road signs', 1, 'easy', 70, 10, true, 3],
        ['Traffic Rules 101', 'Basic traffic rules every driver should know', 2, 'easy', 70, 15, true, 3],
        ['Advanced Road Signs', 'Challenge yourself with advanced road sign questions', 1, 'hard', 80, 20, true, 3],
        ['Defensive Driving Test', 'Evaluate your defensive driving knowledge', 3, 'medium', 75, 15, true, 3]
      ]]
    );

    await db.query(
      'INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, points) VALUES ?',
      [[
        [1, 'What does a red octagonal sign mean?', 'Yield', 'Stop', 'No Entry', 'Speed Limit', 'b', 'A red octagon (8-sided) sign always means STOP. You must come to a complete stop.', 1],
        [1, 'What shape is a yield sign?', 'Circle', 'Octagon', 'Triangle', 'Rectangle', 'c', 'A yield sign is an upside-down triangle (point down).', 1],
        [1, 'What does a sign with a red circle and a slash mean?', 'Something is prohibited', 'Something is allowed', 'Caution', 'Information', 'a', 'A red circle with a diagonal slash indicates something is not allowed (prohibited).', 1],
        [1, 'What color are warning signs?', 'Red and white', 'Yellow and black', 'Green and white', 'Blue and white', 'b', 'Warning signs are typically yellow with black symbols or text.', 1],
        [1, 'What does a green guide sign indicate?', 'Directions to cities', 'Rest areas', 'Speed limits', 'Road hazards', 'a', 'Green signs provide directional guidance and mileage to locations.', 1],
        [2, 'At what blood alcohol concentration is it illegal to drive?', '0.05%', '0.08%', '0.10%', '0.12%', 'b', 'In most states, driving with a BAC of 0.08% or higher is illegal.', 1],
        [2, 'When should you use your turn signals?', 'Only when turning', 'At least 100 feet before turning', 'At the intersection', 'Only at night', 'b', 'Turn signals should be activated at least 100 feet before your turn.', 1],
        [2, 'What is the proper following distance?', '1 second', '2 seconds', '3-4 seconds', '5 seconds', 'c', 'Maintain at least 3-4 seconds of following distance in good conditions.', 1],
        [2, 'When can you legally pass another vehicle?', 'In a school zone', 'On a hill with clear view', 'At an intersection', 'When signs and road markings permit', 'd', 'Only pass when signs and road markings indicate it is safe and legal.', 1]
      ]]
    );

    await db.query(
      'INSERT INTO exams (title, description, category_id, difficulty, pass_score, time_limit, price) VALUES ?',
      [[
        ['Full Road Rules Certification', 'Comprehensive exam covering all road rules and signs', 2, 'hard', 80, 60, 50000],
        ['Defensive Driving Certification', 'Advanced defensive driving certification exam', 3, 'hard', 85, 45, 35000]
      ]]
    );

    await db.query(
      'INSERT INTO exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, points) VALUES ?',
      [[
        [1, 'What should you do when approaching a red traffic light?', 'Slow down and proceed', 'Stop and proceed if clear', 'Come to a complete stop', 'Speed up', 'c', 'A red light requires a complete stop before the stop line or crosswalk.', 1],
        [1, 'What does a flashing yellow traffic light mean?', 'Stop', 'Proceed with caution', 'Speed up', 'No turn', 'b', 'A flashing yellow light means proceed with caution.', 1],
        [1, 'When must you stop for a school bus?', 'Only when children are visible', 'Always when its red lights are flashing', 'Never', 'Only on two-lane roads', 'b', 'You must always stop when a school bus displays flashing red lights.', 1]
      ]]
    );

    await db.query(
      'INSERT INTO subscriptions (user_id, plan, status, start_date, end_date, amount) VALUES (?, ?, ?, ?, ?, ?)',
      [2, 'monthly', 'active', '2024-01-01', '2024-02-01', 25000]
    );

    await db.query(
      'INSERT INTO payments (user_id, subscription_id, amount, payment_method, transaction_id, status, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [2, 1, 25000, 'mtn_momo', 'TXN123456789', 'completed', '2024-01-01 10:00:00']
    );

    await db.query(
      'INSERT INTO leaderboard (user_id, total_points, quizzes_taken, exams_taken, quizzes_passed, exams_passed) VALUES (?, ?, ?, ?, ?, ?)',
      [2, 85, 3, 1, 2, 1]
    );

    await db.query(
      'INSERT INTO documents (title, description, file_url, file_type, category_id, is_free) VALUES (?, ?, ?, ?, ?, ?)',
      ['Road Rules Guide', 'Comprehensive guide covering traffic signals, signs, speed limits, right-of-way rules, and defensive driving techniques', 'uploads/documents/road_rules_guide.txt', 'txt', 2, true]
    );

    console.log('Database seeded successfully!');
    console.log('Admin: admin@roadrules.com / admin123');
    console.log('User: john@example.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
