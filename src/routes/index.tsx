import { createFileRoute } from '@tanstack/react-router'
import CustomerForm from '../components/CustomerForm'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap grid grid-cols-2 grid-rows-4 gap-4 px-4 pb-8 pt-14">
      <CustomerForm className="col-start-1 row-start-1 rise-in" />
      <section className="bg-amber-500 col-start-2 row-start-1 row-span-3 rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14"></section>
      <section className="bg-amber-500 col-start-1 row-start-2 rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14"></section>
      <section className="bg-amber-500 col-start-1 row-start-3 rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14"></section>
      <section className="bg-amber-500 col-start-1 row-start-4 col-span-2 rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14"></section>
    </main>
  )
}
