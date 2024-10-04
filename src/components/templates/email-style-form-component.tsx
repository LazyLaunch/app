import { useForm } from 'react-hook-form'

import { BackgroundSectionComponent } from '@/components/templates/form-sections/background-section-component'
import { BodySectionComponent } from '@/components/templates/form-sections/body-section-component'
import { BorderSectionComponent } from '@/components/templates/form-sections/border-section-component'

import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'

import type { EditorGlobalFormValues } from '@/containers/templates/PlateContainer'

interface Props extends EditorGlobalFormValues {
  onSubmit: (
    values: EditorGlobalFormValues | ((state: EditorGlobalFormValues) => EditorGlobalFormValues)
  ) => void
}

export function EmailStyleFormComponent(props: Props) {
  const { onSubmit, ...rest } = props
  const form = useForm<EditorGlobalFormValues>({
    defaultValues: rest,
  })

  function handleSubmit(values: EditorGlobalFormValues): void {
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
