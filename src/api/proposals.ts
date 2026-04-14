import client from './client'
import type {
  ProposalResponse,
  CreateProposalRequest,
  CastVoteRequest,
  PromoteProposalRequest,
} from '../types'

export const proposalsApi = {
  getAll: (campaignId: number) =>
    client.get<ProposalResponse[]>(`/campaigns/${campaignId}/proposals`).then((r) => r.data),

  create: (campaignId: number, request: CreateProposalRequest) =>
    client.post<ProposalResponse>(`/campaigns/${campaignId}/proposals`, request).then((r) => r.data),

  promote: (campaignId: number, proposalId: number, request: PromoteProposalRequest) =>
    client
      .post<ProposalResponse>(`/campaigns/${campaignId}/proposals/${proposalId}/promote`, request)
      .then((r) => r.data),

  reject: (campaignId: number, proposalId: number) =>
    client
      .post<ProposalResponse>(`/campaigns/${campaignId}/proposals/${proposalId}/reject`)
      .then((r) => r.data),

  castVote: (campaignId: number, proposalId: number, dateId: number, request: CastVoteRequest) =>
    client
      .put<ProposalResponse>(
        `/campaigns/${campaignId}/proposals/${proposalId}/dates/${dateId}/vote`,
        request,
      )
      .then((r) => r.data),
}
