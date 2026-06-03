import { StorageBucket } from '../types';

/**
 * MVP용 시뮬레이션 스토리지 서비스
 * 실제 AWS S3 또는 Supabase Storage 연동 전, URL Placeholder를 반환합니다.
 */
export const StorageService = {
  /**
   * 해당 버킷의 특정 파일에 대한 URL을 가져옵니다.
   */
  getUrl(bucket: StorageBucket, path: string): string {
    // 만약 이미 http(s)로 시작하는 URL이 들어왔다면 그대로 반환
    if (path.startsWith('http')) return path;

    // MVP 시뮬레이션: Bucket에 따라 임의의 Placeholder 이미지 반환
    const cleanPath = path.replace(/[^a-zA-Z0-9]/g, '');
    
    switch (bucket) {
      case 'game-covers':
        return `https://images.igdb.com/igdb/image/upload/t_cover_big/${cleanPath}.jpg`;
      case 'developer-logos':
      case 'publisher-logos':
        return `https://images.igdb.com/igdb/image/upload/t_logo_med/${cleanPath}.png`;
      case 'screenshots':
        return `https://images.igdb.com/igdb/image/upload/t_screenshot_huge/${cleanPath}.jpg`;
      case 'user-uploads':
        return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${cleanPath}&backgroundColor=1A1A1A`;
      default:
        return `https://placehold.co/400x400/1A1A1A/4AEDC4?text=${cleanPath}`;
    }
  },

  /**
   * 실제 스토리지 업로드 시뮬레이션 (MVP에선 URL만 반환)
   */
  async uploadFile(bucket: StorageBucket, file: File): Promise<string> {
    // 실제로는 여기서 multipart/form-data로 API를 찌르고 경로를 반환해야 합니다.
    console.log(`[StorageService] Uploading file ${file.name} to bucket: ${bucket}`);
    
    // 시뮬레이션 지연 시간
    await new Promise(r => setTimeout(r, 500));
    
    return `${file.name}-${Date.now()}`;
  }
};
