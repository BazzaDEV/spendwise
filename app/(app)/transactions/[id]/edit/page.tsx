import EditTransaction from './edit-transaction'

interface PageProps {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  return <EditTransaction id={params.id} />
}
