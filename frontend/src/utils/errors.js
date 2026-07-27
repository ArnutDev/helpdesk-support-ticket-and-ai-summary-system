/**
 * Utility to parse and format API errors into user-friendly messages.
 * Specifically handles FastAPI/Pydantic validation errors (which return an array of error objects).
 */
export function getErrorMessage(error) {
  if (!error) return "เกิดข้อผิดพลาดที่ไม่รู้จัก";

  const response = error.response;
  if (response && response.data) {
    const detail = response.data.detail;

    // Case 1: detail is a simple string
    if (typeof detail === 'string') {
      // Common translations
      if (detail === "Could not validate user") {
        return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      }
      return detail;
    }

    // Case 2: detail is a Pydantic validation error array (FastAPI 422 Unprocessable Entity)
    if (Array.isArray(detail)) {
      return detail
        .map((err) => {
          const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : "";
          const msg = err.msg || "ข้อมูลไม่ถูกต้อง";

          if (field) {
            // Translate common field names
            const fieldLabels = {
              username: "ชื่อผู้ใช้ (Username)",
              email: "อีเมล (Email)",
              password: "รหัสผ่าน (Password)",
              confirm_password: "ยืนยันรหัสผ่าน (Confirm Password)",
              title: "หัวข้อ (Title)",
              description: "รายละเอียด (Description)",
              contact_info: "ข้อมูลติดต่อ (Contact Info)",
              new_role: "บทบาทใหม่ (New Role)",
              new_status: "สถานะใหม่ (New Status)",
            };

            const label = fieldLabels[field] || field;

            // Translate common Pydantic validation messages
            let customMsg = msg;
            if (msg.includes("should have at least") || msg.includes("too_short") || msg.includes("at least")) {
              const minLen = msg.match(/\d+/)?.[0] || "8";
              customMsg = `ต้องมีความยาวอย่างน้อย ${minLen} ตัวอักษร`;
            } else if (msg.includes("value is not a valid email")) {
              customMsg = "รูปแบบอีเมลไม่ถูกต้อง";
            } else if (msg.includes("Value error,")) {
              customMsg = msg.replace("Value error, ", "");
            }

            return `${label}: ${customMsg}`;
          }
          return msg;
        })
        .join("\n");
    }

    // Case 3: Custom message field
    if (response.data.message) {
      return response.data.message;
    }
  }

  // Fallback to axios message
  return error.message || "กรุณาลองใหม่อีกครั้ง";
}
