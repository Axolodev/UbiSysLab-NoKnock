'use client';
import React, { useContext, useState, useEffect } from 'react';
import { Search } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { AppContext } from '@/contexts/AppContext';
import { AvailabilityChip } from '@/components/AvailabilityChip';
import dynamic from 'next/dynamic';
import useUsers from '@/hooks/useUsersData';

// Dynamically import Material-UI components
const FormControl = dynamic(
  () => import('@mui/material').then((mod) => mod.FormControl),
  { ssr: false }
);
const InputLabel = dynamic(
  () => import('@mui/material').then((mod) => mod.InputLabel),
  { ssr: false }
);
const Select = dynamic(
  () => import('@mui/material').then((mod) => mod.Select),
  { ssr: false }
);
const MenuItem = dynamic(
  () => import('@mui/material').then((mod) => mod.MenuItem),
  { ssr: false }
);

export default function SearchPage() {
  const { t } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { users } = useUsers();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setSearchQuery(searchParams.get('query') || '');
  }, []);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  // Early return if context is not yet available
  if (!t || !users) {
    return null; // Or a loading state
  }

  // Set initial department filter after we know t is available
  if (departmentFilter === '') {
    setDepartmentFilter(t('allDepartments'));
  }

  const departments = [
    t('allDepartments'),
    ...new Set(users.map((user) => user.department)),
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      departmentFilter === t('allDepartments') ||
      user.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('directoryTitle')}
        </h1>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              placeholder={t('searchPlaceholder')}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <FormControl
            sx={{ minWidth: 240, width: { xs: '100%', sm: 'auto' } }}
          >
            <InputLabel>{t('department')}</InputLabel>
            <Select
              value={departmentFilter}
              label={t('department')}
              onChange={(e) => setDepartmentFilter(e.target.value as string)}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((person) => (
            <Link
              key={person.id}
              href={`/profile/${person.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <Image
                  width={48}
                  height={48}
                  src={person.avatar}
                  alt={person.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {person.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {person.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {person.department}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <AvailabilityChip
                  status={person.available}
                  isPublic={person.isPublic}
                  isLoggedIn={false}
                />
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            {t('noResults')}
          </div>
        )}
      </div>
    </div>
  );
}
