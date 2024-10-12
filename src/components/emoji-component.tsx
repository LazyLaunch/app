import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export function EmojiComponent(props: any) {
  return <Picker data={data} {...props} />
}
