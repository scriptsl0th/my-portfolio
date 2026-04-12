export interface OsInfo {
  name: string;
  label: string;
  version: string;
  kernel: string;
  shell: string;
  uptime: string;
  packages: string;
  memory: string;
  cpu: string;
  hostname: string;
  color: string;
  icon: string;
}

export const OS_INFO: OsInfo[] = [
  {
    name: 'debian',
    label: 'Debian',
    version: 'Debian GNU/Linux 12 (Bookworm)',
    kernel: '6.1.0-28-amd64',
    shell: 'bash 5.2.15',
    uptime: '47 days, 3 hours',
    packages: '1842 (dpkg)',
    memory: '3.2 GiB / 8 GiB',
    cpu: 'Intel Core i7 @ 3.4GHz',
    hostname: 'aziz@debian-lab',
    color: '#d70a53',
    icon: '🌀',
  },
  {
    name: 'ubuntu',
    label: 'Ubuntu',
    version: 'Ubuntu 24.04 LTS (Noble Numbat)',
    kernel: '6.8.0-51-generic',
    shell: 'zsh 5.9',
    uptime: '12 days, 8 hours',
    packages: '2134 (dpkg), 18 (snap)',
    memory: '5.1 GiB / 16 GiB',
    cpu: 'AMD Ryzen 7 5800H @ 3.2GHz',
    hostname: 'aziz@ubuntu-dev',
    color: '#e95420',
    icon: '🟠',
  },
];
