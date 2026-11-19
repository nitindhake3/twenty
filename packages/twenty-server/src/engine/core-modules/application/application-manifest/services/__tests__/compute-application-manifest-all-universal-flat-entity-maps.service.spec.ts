import { type Manifest } from 'twenty-shared/application';
import { ViewSortDirection } from 'twenty-shared/types';

import { ComputeApplicationManifestAllUniversalFlatEntityMapsService } from 'src/engine/core-modules/application/application-manifest/services/compute-application-manifest-all-universal-flat-entity-maps.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { sortViewSortsByCreation } from 'src/engine/metadata-modules/flat-view/utils/sort-view-sorts-by-creation.util';

describe('ComputeApplicationManifestAllUniversalFlatEntityMapsService', () => {
  const service =
    new ComputeApplicationManifestAllUniversalFlatEntityMapsService();

  const applicationUniversalIdentifier = '11111111-1111-4111-8111-111111111111';
  const viewUniversalIdentifier = '22222222-2222-4222-8222-222222222222';
  const objectUniversalIdentifier = '33333333-3333-4333-8333-333333333333';
  const now = '2026-01-01T00:00:00.000Z';

  const ownerFlatApplication = {
    id: 'app-id',
    universalIdentifier: applicationUniversalIdentifier,
    sourceType: 'LOCAL',
  } as FlatApplication;

  it('preserves the order of sorts in app-defined views by staggering creation timestamps', () => {
    const manifest: Manifest = {
      application: {
        universalIdentifier: applicationUniversalIdentifier,
        displayName: 'Test App',
      } as any,
      objects: [],
      fields: [],
      logicFunctions: [],
      frontComponents: [],
      permissionFlags: [],
      roles: [],
      skills: [],
      agents: [],
      publicAssets: [],
      views: [
        {
          universalIdentifier: viewUniversalIdentifier,
          name: 'All Records',
          objectUniversalIdentifier,
          sorts: [
            {
              // ID that would sort after sort-2 if ordered by ID
              universalIdentifier: 'sort-z-priority-1',
              fieldMetadataUniversalIdentifier:
                'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
              direction: ViewSortDirection.DESC,
            },
            {
              universalIdentifier: 'sort-m-priority-2',
              fieldMetadataUniversalIdentifier:
                'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
              direction: ViewSortDirection.ASC,
            },
            {
              // ID that would sort before sort-1 if ordered by ID
              universalIdentifier: 'sort-a-priority-3',
              fieldMetadataUniversalIdentifier:
                'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
              direction: ViewSortDirection.DESC,
            },
          ],
        },
      ],
      viewFields: [],
      navigationMenuItems: [],
      pageLayouts: [],
      pageLayoutTabs: [],
      pageLayoutWidgets: [],
      commandMenuItems: [],
      timelineActivityTypes: [],
      settingsMenuItems: [],
    };

    const result = service.compute({
      manifest,
      ownerFlatApplication,
      fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      existingAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      now,
    });

    const flatViewSorts = Object.values(
      result.flatViewSortMaps.byUniversalIdentifier,
    );

    expect(flatViewSorts).toHaveLength(3);

    const sort1 =
      result.flatViewSortMaps.byUniversalIdentifier['sort-z-priority-1'];
    const sort2 =
      result.flatViewSortMaps.byUniversalIdentifier['sort-m-priority-2'];
    const sort3 =
      result.flatViewSortMaps.byUniversalIdentifier['sort-a-priority-3'];

    expect(sort1?.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(sort2?.createdAt).toBe('2026-01-01T00:00:01.000Z');
    expect(sort3?.createdAt).toBe('2026-01-01T00:00:02.000Z');

    // When view sorts are ordered by creation date, the manifest priority is preserved
    // even if IDs would otherwise sort them differently (a < m < z)
    const sorted = sortViewSortsByCreation([
      { id: sort3!.universalIdentifier, createdAt: sort3!.createdAt },
      { id: sort1!.universalIdentifier, createdAt: sort1!.createdAt },
      { id: sort2!.universalIdentifier, createdAt: sort2!.createdAt },
    ]);

    expect(sorted.map(({ id }) => id)).toEqual([
      'sort-z-priority-1',
      'sort-m-priority-2',
      'sort-a-priority-3',
    ]);
  });
});
