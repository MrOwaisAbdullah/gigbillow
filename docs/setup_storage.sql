-- Create the storage bucket for images
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Policy to allow authenticated users to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'images' );

-- Policy to allow authenticated users to update their own images (optional, but good for overwrites)
create policy "Authenticated users can update images"
on storage.objects for update
to authenticated
using ( bucket_id = 'images' );

-- Policy to allow everyone to view images (since they are public)
create policy "Public can view images"
on storage.objects for select
to public
using ( bucket_id = 'images' );

-- Policy to allow authenticated users to delete images (optional)
create policy "Authenticated users can delete images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'images' );
