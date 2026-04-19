import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: () => {
    throw redirect({
      to: '/timeline',
      search: { redirect: window.location.pathname },
    });
  },
});

function RouteComponent() {
  return <div>Hello "/"!</div>;
}
