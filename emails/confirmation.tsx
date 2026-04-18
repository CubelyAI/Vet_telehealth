import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

interface BookingConfirmationEmailProps {
  customerName: string
  petName: string
  appointmentDatetime: Date
  vetName: string
  confirmationUrl: string
  bookingToken: string
}

export function BookingConfirmationEmail({
  customerName,
  petName,
  appointmentDatetime,
  vetName,
  confirmationUrl,
  bookingToken,
}: BookingConfirmationEmailProps) {
  const formattedDate = new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(appointmentDatetime))

  return (
    <Html>
      <Head />
      <Preview>Your vet consultation for {petName} is confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>VetConnect</Heading>
          <Heading style={h2}>Booking Confirmed!</Heading>

          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Your telehealth consultation has been confirmed. Here are your booking details:
          </Text>

          <Section style={detailsBox}>
            <Row>
              <Text style={detailLabel}>Pet</Text>
              <Text style={detailValue}>{petName}</Text>
            </Row>
            <Row>
              <Text style={detailLabel}>Date & Time</Text>
              <Text style={detailValue}>{formattedDate}</Text>
            </Row>
            <Row>
              <Text style={detailLabel}>Vet</Text>
              <Text style={detailValue}>{vetName}</Text>
            </Row>
          </Section>

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button style={button} href={confirmationUrl}>
              View Booking Details
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={smallText}>
            Your unique booking reference is{' '}
            <span style={{ fontFamily: 'monospace' }}>{bookingToken}</span>. Keep this email safe —
            the link above will always show your booking details.
          </Text>

          <Text style={smallText}>
            If you need to cancel or have any questions, please contact us by replying to this email.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            VetConnect · Telehealth veterinary services
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#fafafa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e4e4e7',
  borderRadius: '8px',
  margin: '40px auto',
  maxWidth: '560px',
  padding: '40px',
}

const h1: React.CSSProperties = {
  color: '#18181b',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 24px',
}

const h2: React.CSSProperties = {
  color: '#18181b',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const text: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
}

const detailsBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '16px 0',
}

const detailLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  margin: '0',
}

const detailValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '15px',
  fontWeight: '500',
  margin: '2px 0 12px',
}

const button: React.CSSProperties = {
  backgroundColor: '#18181b',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
}

const hr: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '24px 0',
}

const smallText: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 12px',
}

const footer: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '12px',
  margin: '0',
}
