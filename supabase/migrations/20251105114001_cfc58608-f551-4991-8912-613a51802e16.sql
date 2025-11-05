-- Allow anyone to delete their own comments
CREATE POLICY "Anyone can delete comments"
ON public.comments
FOR DELETE
USING (true);