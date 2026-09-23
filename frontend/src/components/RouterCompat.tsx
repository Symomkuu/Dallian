'use client';

import React from 'react';
import NextLink from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

interface LinkCompatProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
  replace?: boolean;
  state?: unknown;
  children?: React.ReactNode;
}

export function Link({ to, href, children, className, ...props }: LinkCompatProps) {
  const target = href ?? to ?? '#';
  return (
    <NextLink href={target} className={className} {...props}>
      {children}
    </NextLink>
  );
}

export function Outlet({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function NavLink({
  to,
  end,
  className,
  children,
  ...props
}: {
  to: string;
  end?: boolean;
  className?: string | ((params: { isActive: boolean }) => string);
  children?: React.ReactNode;
  [key: string]: unknown;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
  const targetPath = to.split('?')[0];
  const currentPath = pathname.split('?')[0];
  const isActive = end
    ? current === to || currentPath === targetPath
    : current === to || currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

  const resolvedClassName =
    typeof className === 'function' ? className({ isActive }) : className ?? '';

  return (
    <NextLink href={to} className={resolvedClassName} {...props}>
      {children}
    </NextLink>
  );
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  return {
    pathname,
    search: search ? `?${search}` : '',
    hash: '',
    state: undefined,
  };
}

export function useNavigate() {
  const router = useRouter();

  return (path: string) => {
    router.push(path);
  };
}

export function useParams<T extends Record<string, string | string[]>>(): T {
  return useNextParams() as T;
}
