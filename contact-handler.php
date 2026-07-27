<?php
/**
 * contact-handler.php
 * Receives the portfolio contact form (fetch/JSON POST) and emails it.
 *
 * SETUP:
 * 1. Set $to_email below to the address that should receive messages.
 * 2. This uses PHP's built-in mail(). Many hosts (shared hosting, cPanel)
 *    have mail() configured out of the box. If messages don't arrive,
 *    your host likely needs SMTP instead — see the note at the bottom.
 * 3. Upload this file to the SAME server as index.html (mail() won't
 *    work on GitHub Pages, which only serves static files — see note).
 */

header('Content-Type: application/json');

// ---- CONFIG -----------------------------------------------------
$to_email   = "techowasco@gmail.com"; // <-- messages will be sent here
$site_name  = "Lazarus Owah Portfolio";
// -------------------------------------------------------------------

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["ok" => false, "error" => "Method not allowed"]);
    exit;
}

// Read JSON body
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    // fall back to normal form POST if not sent as JSON
    $data = $_POST;
}

$name    = trim($data['name'] ?? '');
$email   = trim($data['email'] ?? '');
$subject = trim($data['subject'] ?? 'New message from portfolio site');
$message = trim($data['message'] ?? '');
$honeypot = trim($data['company'] ?? ''); // hidden spam-trap field, must stay empty

// Basic spam trap: bots often fill every field, including hidden ones
if ($honeypot !== '') {
    echo json_encode(["ok" => true]); // pretend success, don't send
    exit;
}

// Validation
$errors = [];
if ($name === '') $errors[] = "Name is required.";
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "A valid email is required.";
if ($message === '') $errors[] = "Message is required.";

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(["ok" => false, "error" => implode(' ', $errors)]);
    exit;
}

// Build email
$body = "New message from {$site_name}\n\n";
$body .= "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= "Subject: {$subject}\n\n";
$body .= "Message:\n{$message}\n";

$headers = [];
$headers[] = "From: {$site_name} <no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ">";
$headers[] = "Reply-To: {$name} <{$email}>";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

$sent = mail($to_email, "[Portfolio] {$subject}", $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(["ok" => true]);
} else {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Could not send message. Please try again later."]);
}

/**
 * NOTE on hosting:
 * - GitHub Pages serves static files only — PHP will NOT run there.
 *   To use this handler, host on something that runs PHP (e.g. shared
 *   hosting like Hostinger/Namecheap, or a small VPS). The static
 *   site (index.html/css/js) can stay on GitHub Pages while this one
 *   file lives elsewhere — just point the fetch() URL in js/script.js
 *   at that server's full URL instead of a relative path.
 * - If mail() silently fails on your host, ask your host how outbound
 *   mail is configured, or switch to PHPMailer with SMTP credentials.
 */
