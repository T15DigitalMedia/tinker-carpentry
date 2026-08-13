import { emailStyles as s } from "./styles";

export type ContactMessageEmailProps = {
  name: string;
  email: string;
  message: string;
};

export function ContactMessageEmail({ name, email, message }: ContactMessageEmailProps) {
  return (
    <html>
      <body style={s.body}>
        <div style={s.container}>
          <h1 style={s.heading}>New contact form message</h1>
          <p style={s.orderRef}>
            From {name} &lt;{email}&gt;
          </p>

          <p style={{ ...s.paragraph, whiteSpace: "pre-wrap" }}>{message}</p>

          <p style={s.footer}>Reply directly to this email to respond to {name}.</p>
        </div>
      </body>
    </html>
  );
}

// Sample data so `npm run email:dev` has something to render — this default
// export isn't used in production sends, only picked up by the react-email
// preview server, which requires one per file.
export default function ContactMessageEmailPreview() {
  return (
    <ContactMessageEmail
      name="Jordan Rivers"
      email="jordan@example.com"
      message="Hi there — do you take custom commissions for dining tables? I'm looking for something in walnut, roughly 72 inches long."
    />
  );
}
