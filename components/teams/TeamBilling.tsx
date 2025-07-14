'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Users, Activity } from 'lucide-react'
import { toast } from 'sonner'

interface TeamBillingProps {
  teamId: string
}

export default function TeamBilling({ teamId }: TeamBillingProps) {
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [usage, setUsage] = useState<any>(null)

  useEffect(() => {
    fetchBillingInfo()
  }, [teamId])

  const fetchBillingInfo = async () => {
    try {
      // TODO: Implement team billing API
      // For now, showing placeholder data
      setSubscription({
        plan: 'team',
        status: 'active',
        memberLimit: 10,
        currentMembers: 3
      })
      setUsage({
        snippets: 45,
        apiCalls: 1250,
        aiGenerations: 89
      })
    } catch (error) {
      console.error('Error fetching billing info:', error)
    }
  }

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      // TODO: Implement Stripe checkout for team upgrade
      toast.success('Redirecting to checkout...')
    } catch (error) {
      toast.error('Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setLoading(true)
    try {
      // TODO: Implement Stripe customer portal for teams
      toast.success('Redirecting to billing portal...')
    } catch (error) {
      toast.error('Failed to open billing portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Team Subscription</CardTitle>
              <CardDescription>Manage your team's billing and subscription</CardDescription>
            </div>
            {subscription && (
              <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                {subscription.plan} - {subscription.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Team Members</p>
                <p className="text-2xl font-bold">
                  {subscription?.currentMembers || 0} / {subscription?.memberLimit || 10}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">API Calls</p>
                <p className="text-2xl font-bold">{usage?.apiCalls || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Monthly Cost</p>
                <p className="text-2xl font-bold">$49</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleManageBilling} disabled={loading}>
              Manage Billing
            </Button>
            <Button variant="outline" onClick={handleUpgrade} disabled={loading}>
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Track your team's resource usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Code Snippets</span>
              <span className="font-medium">{usage?.snippets || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Calls</span>
              <span className="font-medium">{usage?.apiCalls || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">AI Generations</span>
              <span className="font-medium">{usage?.aiGenerations || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}