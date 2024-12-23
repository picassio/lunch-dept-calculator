import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: 'Manage Users',
      description: 'Add and view users in your group',
      href: '/users',
      color: 'bg-blue-500',
    },
    {
      title: 'Menu Items',
      description: 'Manage food and drink items with prices',
      href: '/menu-items',
      color: 'bg-green-500',
    },
    {
      title: 'Add New Debt',
      description: 'Record new debts for group members',
      href: '/debts/new',
      color: 'bg-purple-500',
    },
    {
      title: 'Group Overview',
      description: 'View total debts for the entire group',
      href: '/debts/group',
      color: 'bg-orange-500',
    },
    {
      title: 'Individual Debts',
      description: 'Check detailed debts for each person',
      href: '/debts/individual',
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Group Debt Manager
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Easily manage and track shared expenses within your group
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="relative group rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all duration-200 hover:shadow-lg"
            >
              <div>
                <div className={`inline-flex p-3 ${feature.color} rounded-lg text-white mb-4`}>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {feature.description}
                </p>
              </div>
              <span
                className="absolute inset-0 rounded-lg"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
