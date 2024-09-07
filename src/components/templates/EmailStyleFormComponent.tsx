import { useForm } from 'react-hook-form'

import { BackgroundSectionComponent } from '@/components/templates/form-sections/background-section-component'
import { BodySectionComponent } from '@/components/templates/form-sections/body-section-component'
import { BorderSectionComponent } from '@/components/templates/form-sections/border-section-component'

import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'

import type { FormValues } from '@/containers/templates/PlateContainer'

interface Props extends FormValues {
  onSubmit: (values: FormValues | ((state: FormValues) => FormValues)) => void
}

export function EmailStyleFormComponent(props: Props) {
  const { onSubmit, ...rest } = props
  const form = useForm<FormValues>({
    defaultValues: rest,
  })

  function handleSubmit(values: FormValues): void {
    onSubmit((prevState) => ({ ...prevState, ...values }))
  }

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(handleSubmit)} className="space-y-4 pb-4">
        <BackgroundSectionComponent form={form} onReset={onSubmit} className="px-4" />
        <Separator />
        <BodySectionComponent form={form} onReset={onSubmit} className="px-4" />
        <Separator />
        <BorderSectionComponent form={form} onReset={onSubmit} className="px-4" />
      </form>
    </Form>
  )
}
