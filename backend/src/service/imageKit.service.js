import ImageKit,{toFile} from '@imagekit/nodejs'
import {config} from '../config/config.js'

const client = new ImageKit({
    privateKey:config.IMAGEKIT_PRIVATE_KEY
})

const uploadFiles =async ({buffer ,fileName,folder="snitch"})=>{
    const files = await client.files.upload({
        file:await ImageKit.toFile(buffer),
        fileName,
        folder
    })
    return files
}

export default uploadFiles