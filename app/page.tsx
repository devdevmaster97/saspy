import { redirect } from 'next/navigation';

export default function Home() {
  // Redirecionar para a página do menu principal
  redirect('/menu');
}
