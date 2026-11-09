import React, { useState, useEffect, useMemo, useCallback } from 'react';

import type { User } from '../types';

import { getUsers } from '../services/api';

interface UserRow extends User {
  searchableText: string;
  joinedDate: Date;
  joinedCategory: 'new' | 'recent' | 'old';
  fullName: string;
  initials: string;
}

const UserList = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [joinedFilter, setJoinedFilter] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        const processedUsers = data.map((user): UserRow => ({
          ...user,
          searchableText: `${user.firstname.toLowerCase()} ${user.lastname.toLowerCase()} ${user.username.toLowerCase()}`,
          joinedDate: new Date(user.created_at),
          joinedCategory: (() => {
            const created = new Date(user.created_at);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - created.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays < 7 ? 'new' : diffDays < 30 ? 'recent' : 'old';
          })(),
          fullName: `${user.firstname} ${user.lastname}`,
          initials: `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`
        }));
        setUsers(processedUsers);
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const searchUsers = useCallback((user: UserRow, term: string) => {
    if (!term) return true;

    const searchWords = term.toLowerCase().split(' ');

    const searchFields = [
      user.searchableText,
      user.fullName.toLowerCase(),
      user.initials.toLowerCase(),
      new Date(user.created_at).toLocaleDateString()
    ];

    return searchWords.every((word) => {
      const searchOptions = searchFields.map((field) => ({
        field,
        weight: field === user.searchableText ? 2 : 1
      }));

      return searchOptions.some((option) => {
        const words = option.field.split(' ');
        return words.some((fieldWord) => {
          const normalizedFieldWord = fieldWord.trim().toLowerCase();
          const normalizedSearchWord = word.trim().toLowerCase();

          if (normalizedFieldWord.includes(normalizedSearchWord)) {
            return Number(true) * option.weight;
          }

          const matrix = Array(normalizedFieldWord.length + 1)
            .fill(null)
            .map(() => Array(normalizedSearchWord.length + 1).fill(null));

          for (let i = 0; i <= normalizedFieldWord.length; i++) {
            matrix[i][0] = i;
          }
          for (let j = 0; j <= normalizedSearchWord.length; j++) {
            matrix[0][j] = j;
          }

          for (let i = 1; i <= normalizedFieldWord.length; i++) {
            for (let j = 1; j <= normalizedSearchWord.length; j++) {
              const cost = normalizedFieldWord[i - 1] === normalizedSearchWord[j - 1] ? 0 : 1;
              matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
            }
          }

          const maxLength = Math.max(normalizedFieldWord.length, normalizedSearchWord.length);
          const threshold = Math.floor(maxLength * 0.3);
          return matrix[normalizedFieldWord.length][normalizedSearchWord.length] <= threshold;
        });
      });
    });
  }, []);

  const sortUsers = useCallback(
    (a: UserRow, b: UserRow) => {
      let compareValueA: string | number, compareValueB: string | number;

      switch (sortField) {
        case 'name':
          compareValueA = `${a.firstname}${a.lastname}`.toLowerCase();
          compareValueB = `${b.firstname}${b.lastname}`.toLowerCase();
          break;
        case 'username':
          compareValueA = a.username.toLowerCase();
          compareValueB = b.username.toLowerCase();
          break;
        case 'joined':
          compareValueA = new Date(a.created_at).getTime();
          compareValueB = new Date(b.created_at).getTime();
          break;
        default:
          compareValueA = a[sortField as keyof User];
          compareValueB = b[sortField as keyof User];
      }

      if (sortDirection === 'asc') {
        return compareValueA < compareValueB ? -1 : compareValueA > compareValueB ? 1 : 0;
      } else {
        return compareValueB < compareValueA ? -1 : compareValueB > compareValueA ? 1 : 0;
      }
    },
    [sortField, sortDirection]
  );

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const searchMatch = searchUsers(user, searchTerm);

        let joinedMatch = true;
        if (joinedFilter) {
          const now = new Date();
          const userDate = new Date(user.created_at);
          const diffTime = Math.abs(now.getTime() - userDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          switch (joinedFilter) {
            case 'week':
              joinedMatch = diffDays <= 7 && user.joinedCategory === 'new';
              break;
            case 'month':
              joinedMatch = diffDays <= 30 && user.joinedCategory === 'recent';
              break;
            case 'older':
              joinedMatch = diffDays > 30 && user.joinedCategory === 'old';
              break;
            default:
              joinedMatch = true;
          }
        }

        return searchMatch && joinedMatch;
      })
      .sort(sortUsers);
  }, [users, searchTerm, joinedFilter, searchUsers, sortUsers]);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-5">Users</h2>

      <div className="flex gap-2.5 mb-5">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded border border-solid border-[#ddd] flex-1"
        />

        <label className="sr-only" htmlFor="joined-filter">
          Filter users by join date
        </label>
        <select
          id="joined-filter"
          value={joinedFilter}
          onChange={(e) => setJoinedFilter(e.target.value)}
          className="p-2 rounded border border-solid border-[#ddd]"
        >
          <option value="">All Users</option>
          <option value="week">Joined this week</option>
          <option value="month">Joined this month</option>
          <option value="older">Joined earlier</option>
        </select>

        <label className="sr-only" htmlFor="sort-field">
          Sort users by
        </label>
        <select
          id="sort-field"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="p-2 rounded border border-solid border-[#ddd]"
        >
          <option value="name">Sort by Name</option>
          <option value="username">Sort by Username</option>
          <option value="joined">Sort by Join Date</option>
        </select>

        <button
          onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          className="p-2 rounded border border-solid border-[#ddd] bg-white cursor-pointer"
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {error && <div className="text-[red] p-2.5 bg-[#ffebee] mb-5 rounded">{error}</div>}

      <div className="grid gap-[15px]">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="border border-solid border-[#ddd] rounded-lg p-[15px] bg-white flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-bold m-0 mb-1.25">
                {user.firstname} {user.lastname}
              </h3>
              <p className="m-0 text-[#666]">@{user.username}</p>
            </div>
            <div className="bg-[#e3f2fd] py-1.25 px-2.5 rounded text-[0.9em]">
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <p className="my-4 text-center text-[#666]">No users found matching your criteria</p>
      )}
    </div>
  );
};

export default UserList;
