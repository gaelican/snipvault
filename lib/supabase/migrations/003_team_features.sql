-- Add team invitations table
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role user_role DEFAULT 'member' NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  accepted BOOLEAN DEFAULT FALSE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(team_id, email)
);

-- Add team activity feed table
CREATE TYPE activity_type AS ENUM (
  'member_joined',
  'member_left',
  'member_invited',
  'member_role_changed',
  'snippet_created',
  'snippet_updated',
  'snippet_deleted',
  'team_created',
  'team_updated'
);

CREATE TABLE IF NOT EXISTS public.team_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  activity_type activity_type NOT NULL,
  entity_type TEXT, -- 'snippet', 'member', 'team'
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Add team subscription relationship
ALTER TABLE public.subscriptions ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;

-- Add indexes
CREATE INDEX idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_activities_team_id ON public.team_activities(team_id);
CREATE INDEX idx_team_activities_created_at ON public.team_activities(created_at DESC);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;

-- Team invitations policies
CREATE POLICY "Team admins can view invitations" ON public.team_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_invitations.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Team admins can create invitations" ON public.team_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_invitations.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Team admins can delete invitations" ON public.team_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_invitations.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'owner')
    )
  );

-- Team activities policies
CREATE POLICY "Team members can view activities" ON public.team_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_activities.team_id
      AND tm.user_id = auth.uid()
    )
  );

-- Function to log team activity
CREATE OR REPLACE FUNCTION public.log_team_activity(
  p_team_id UUID,
  p_user_id UUID,
  p_activity_type activity_type,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.team_activities (
    team_id,
    user_id,
    activity_type,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    p_team_id,
    p_user_id,
    p_activity_type,
    p_entity_type,
    p_entity_id,
    p_metadata
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update types in TypeScript types file
-- Add to Database type:
-- team_invitations table
-- team_activities table
-- activity_type enum

-- Update subscription_plan enum to include 'individual'
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'individual';