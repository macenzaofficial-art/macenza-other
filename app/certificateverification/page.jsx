import CertificateVerification from '@/components/pages/CertificateVerification';

export const metadata = {
  title: 'Certificate Verification',
  description: 'Verify official certificates issued by Macenza.',
  alternates: {
    canonical: 'https://www.macenza.com/certificateverification',
  },
};

export default function Page() {
  return <CertificateVerification />;
}
