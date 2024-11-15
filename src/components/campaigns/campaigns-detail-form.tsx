import { useForm } from 'react-hook-form'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { CSRF_TOKEN } from '@/constants'
import type { CampaignDetails } from '@/stores/campaign-store'

import { $campaign } from '@/stores/campaign-store'

interface FormValues extends CampaignDetails {
  [CSRF_TOKEN]: string
}

function onSubmit(values: FormValues) {
  console.log(values)
}

export function CampaignsDetailForm({
  className,
  cancelUrl,
  defaultValues,
}: {
  className: string
  cancelUrl: string
  defaultValues: FormValues
}) {
  const form = useForm<FormValues>({
    defaultValues,
  })

  return (
    <Form {...form}>
      <form className={className} onSubmit={form.handleSubmit(onSubmit)}>
        <input
          {...form.register(CSRF_TOKEN, { required: true })}
          type="hidden"
          name={CSRF_TOKEN}
          value={defaultValues.csrfToken}
        />
        <Card className="w-full">
          <CardContent className="space-y-8 pt-6">
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: 'Name is required.',
              }}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder="Enter your campaign name"
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a unique and recognizable name for this email campaign. It will help you
                    identify it in your campaign dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              rules={{
                required: 'Subject is required.',
              }}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Email Subject</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value
                        $campaign.setKey('subject', val)
                        field.onChange(e)
                      }}
                      value={field.value || ''}
                      placeholder="Enter the subject line"
                    />
                  </FormControl>
                  <FormDescription>
                    The subject line is the first thing your recipients will see. Make it engaging
                    to increase the chances of the email being opened.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="from"
              rules={{
                required: 'Sender name is required.',
              }}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Sender Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder="Enter sender name"
                      onChange={(e) => {
                        const val = e.target.value
                        $campaign.setKey('from', val)
                        field.onChange(e)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the name that will appear in your recipient’s inbox. Ensure it's
                    recognizable and trustworthy.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preheader"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Preheader Text</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder="Enter preheader text"
                      onChange={(e) => {
                        const val = e.target.value
                        $campaign.setKey('preheader', val)
                        field.onChange(e)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The preheader appears next to the subject in most email clients. Use it to give
                    a preview of the email content and entice readers to open.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipients"
              rules={{
                required: 'Recipients field is required.',
              }}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Recipients</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder="Click to add your recipients"
                    />
                  </FormControl>
                  <FormDescription>
                    Select one or more pre-defined recipient groups for this campaign.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <a className={buttonVariants({ variant: 'outline' })} href={cancelUrl}>
              Cancel
            </a>
            <Button type="submit">Next</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
