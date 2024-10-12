import { useForm } from 'react-hook-form'

import { BackgroundSectionComponent } from '@/components/templates/form-sections/background-section-component'
import { BodySectionComponent } from '@/components/templates/form-sections/body-section-component'
import { BorderSectionComponent } from '@/components/templates/form-sections/border-section-component'

import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'

import { $emailTemplate, DEFAULT_SETTINGS } from '@/stores/template-store'

import type { EmailTemplateSettings } from '@/stores/template-store'

function handleSubmit(values: EmailTemplateSettings): void {
  $emailTemplate.setKey('settings', values)
}

export function EmailStyleFormComponent({ settings }: { settings: string }) {
  const form = useForm<EmailTemplateSettings>({
    defaultValues: settings ? JSON.parse(settings) : DEFAULT_SETTINGS,
  })

  function onReset(fn: (state: EmailTemplateSettings) => EmailTemplateSettings) {
    const state = fn(form.getValues())
    form.reset(state)
    $emailTemplate.setKey('settings', state)
  }

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(handleSubmit)} className="space-y-4 pb-4">
        <BackgroundSectionComponent form={form} onReset={onReset} className="px-4" />
        <Separator />
        <BodySectionComponent form={form} onReset={onReset} className="px-4" />
        <Separator />
        <BorderSectionComponent form={form} onReset={onReset} className="px-4" />
      </form>
    </Form>
  )
}
