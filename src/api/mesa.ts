import client from './client'
import type { CampaignImage, MesaDoc } from '../types'

// «La mesa» (MesaController): the public document of the director's screen and the images of the campaign. Any member reads;
// only the director uploads or deletes (403 otherwise). The PUT that writes the document is the screen's (gmScreenApi).
export const mesaApi = {
  get: (campaignId: number) =>
    client.get<MesaDoc>(`/campaigns/${campaignId}/mesa`).then((r) => r.data),

  listImages: (campaignId: number) =>
    client.get<CampaignImage[]>(`/campaigns/${campaignId}/mesa/imagenes`).then((r) => r.data),

  // The image needs the token, so it comes as a blob for an object URL, never as an <img src> to the API
  getImage: (campaignId: number, imageId: number) =>
    client.get<Blob>(`/campaigns/${campaignId}/mesa/imagenes/${imageId}`, { responseType: 'blob' }).then((r) => r.data),

  uploadImage: (campaignId: number, file: File) => {
    const form = new FormData()
    form.append('file', file, file.name)
    // The client's default JSON type would turn the form into JSON: multipart lets the browser add the boundary
    return client.post<CampaignImage>(`/campaigns/${campaignId}/mesa/imagenes`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
  },

  deleteImage: (campaignId: number, imageId: number) =>
    client.delete(`/campaigns/${campaignId}/mesa/imagenes/${imageId}`),
}
