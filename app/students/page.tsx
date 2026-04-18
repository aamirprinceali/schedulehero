import { redirect } from 'next/navigation';

// /students is superseded by /queue (Ready to Schedule) and /scheduled (Active students)
export default function StudentsPage() {
  redirect('/queue');
}
