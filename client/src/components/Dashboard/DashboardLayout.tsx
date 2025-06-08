import { Tab } from '@headlessui/react'
import {
  ChartBarSquareIcon,
  ClockIcon,
  UserGroupIcon,
  ChartPieIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline'
import { CategoryId } from '../../types/dashboard'
import { classNames } from '../../utils/styles'

const categories: { id: CategoryId; name: string; icon: React.ElementType; description: string }[] =
  [
    {
      id: 'overview',
      name: 'Overview',
      icon: ViewColumnsIcon,
      description: 'All charts overview'
    },
    {
      id: 'time',
      name: 'Time Analysis',
      icon: ClockIcon,
      description: 'Release trends and patterns over time'
    },
    {
      id: 'distribution',
      name: 'Distribution',
      icon: ChartPieIcon,
      description: 'Release distribution analysis'
    },
    {
      id: 'contributors',
      name: 'Contributors',
      icon: UserGroupIcon,
      description: 'Contributor analysis'
    },
    {
      id: 'types',
      name: 'Release Types',
      icon: ChartBarSquareIcon,
      description: 'Analysis of different release types'
    }
  ]

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Release Analytics Dashboard
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                  {categories.map(category => (
                    <Tab
                      key={category.id}
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                          selected
                            ? 'bg-white text-blue-700 shadow'
                            : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                        )
                      }
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <category.icon className="h-5 w-5" />
                        <span>{category.name}</span>
                      </div>
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels className="mt-6">
                  {categories.map(category => (
                    <Tab.Panel
                      key={category.id}
                      className={classNames(
                        'rounded-xl bg-white p-3',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                      )}
                    >
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">{category.name}</h2>
                      <p className="text-gray-500 mb-6">{category.description}</p>
                      {/* 각 카테고리별 차트 컴포넌트들이 들어갈 자리 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* ChartContainer 컴포넌트들이 여기에 들어갑니다 */}
                      </div>
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
