import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { BrandService } from "../../services/brand.service";
import { NotificationService } from "../../services/notification.service";
import { Store } from "@ngrx/store";
import * as BrandActions from "./brand.action";
import { selectAllBrands } from "./brand.selectors";
import { withLatestFrom, filter, exhaustMap, map, catchError, of } from "rxjs";

@Injectable()
export class BrandEffects {
    private actions$ = inject(Actions);
    private brandService = inject(BrandService);
    private notification = inject(NotificationService);
    private store = inject(Store);

    loadBrands$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandActions.loadBrands),
            exhaustMap(() =>
                this.brandService.getAllBrands().pipe(
                    map((response) => BrandActions.loadBrandsSuccess({ 
                        brands: response.items || [], 
                        totalRecords: response.totalRecords || 0,
                        pageNumber: response.pageNumber || 1,
                        pageSize: response.pageSize || 10,
                        totalPages: response.totalPages || 1
                    })),
                    catchError((error) =>
                        of(BrandActions.loadBrandsFailure({ error: error?.message || 'Failed to load brands' }))
                    )
                )
            )
        )
    );


    loadSingleBrand$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandActions.loadSingleBrand),
            exhaustMap(({ brandId }) =>
                this.brandService.getBrandById(brandId).pipe(
                    map((brand) => BrandActions.loadSingleBrandSuccess({ brand })),
                    catchError((error) =>
                        of(BrandActions.loadSingleBrandFailure({ error: error?.message || 'Failed to load brand' }))
                    )
                )
            )
        )
    )

    createBrand$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandActions.createBrand),
            exhaustMap(({ brand }) =>
                this.brandService.createBrand(brand).pipe(
                    map((createdBrand) => {
                        this.notification.showSuccess('Brand created successfully!');
                        return BrandActions.createBrandSuccess({ brand: createdBrand });
                    }),
                    catchError((error) => {
                        this.notification.showError(error?.message || 'Failed to create brand');
                        return of(BrandActions.createBrandFailure({ error: error?.message || 'Failed to create brand' }));
                    })
                )
            )
        )
    )

    updateBrand$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandActions.updateBrand),
            exhaustMap(({ brandId, brand }) =>
                this.brandService.updateBrand(brandId, brand).pipe(
                    map((updatedBrand) => {
                        this.notification.showSuccess('Brand updated successfully!');
                        return BrandActions.updateBrandSuccess({ brand: updatedBrand });
                    }),
                    catchError((error) => {
                        this.notification.showError(error?.message || 'Failed to update brand');
                        return of(BrandActions.updateBrandFailure({ error: error?.message || 'Failed to update brand' }));
                    })
                )
            )
        )
    )

    deleteBrand$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandActions.deleteBrand),
            exhaustMap(({ brandId }) =>
                this.brandService.deleteBrand(brandId).pipe(
                    map(() => {
                        this.notification.showSuccess('Brand deleted successfully.');
                        return BrandActions.deleteBrandSuccess({ brandId });
                    }),
                    catchError((error) => {
                        this.notification.showError(error?.message || 'Failed to delete brand');
                        return of(BrandActions.deleteBrandFailure({ error: error?.message || 'Failed to delete brand' }));
                    })
                )
            )
        )
    )

}


