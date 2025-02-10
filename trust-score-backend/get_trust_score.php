<?php
header("Content-Type: application/json");
require 'db_connection.php'; // Include database connection file

if (isset($_GET['user_id'])) {
    $user_id = intval($_GET['user_id']);

    $query = "SELECT ts.score, ts.grade, 
                     COUNT(la.id) AS linked_accounts,
                     GROUP_CONCAT(la.platform) AS platforms
              FROM trust_scores ts
              LEFT JOIN linked_accounts la ON ts.user_id = la.user_id
              WHERE ts.user_id = ?";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode($result->fetch_assoc());
    } else {
        echo json_encode(["message" => "No data found"]);
    }
} else {
    echo json_encode(["error" => "User ID is required"]);
}
?>
