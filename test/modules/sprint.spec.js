import axios from 'axios'
import Sprint from '@/modules/sprint'
import Baracoda from '@/modules/baracoda'
import config from '@/nuxt.config'

jest.mock('@/modules/baracoda')

// TODO: move out into helper
const errorResponse = new Error('There was an error')
const rejectPromise = () => Promise.reject(errorResponse)

const layout = {
  barcodeFields: [
    {
      x: 16,
      y: 1,
      cellWidth: 0.2,
      barcodeType: 'code39',
      value: 'DN111111',
      height: 5
    }
  ],
  textFields: [
    {
      x: 3,
      y: 3,
      value: 'DN111111',
      font: 'proportional',
      fontSize: 1.7
    },
    {
      x: 57,
      y: 3,
      value: 'LHTR',
      font: 'proportional',
      fontSize: 1.7
    }
  ]
}

describe('Sprint', () => {
  it('#createLayout', () => {
    expect(Sprint.createLayout('DN111111', 'DN222222')).toEqual(layout)
  })

  describe('#createPrintRequestBody', () => {
    it('should produce the correct json if there is a single barcode', () => {
      const body = Sprint.createPrintRequestBody({
        barcodes: ['DN111111'],
        printer: 'heron-bc3'
      })
      expect(body.query).toBeDefined()
      const variables = body.variables
      expect(variables).toBeDefined()
      expect(variables.printer).toEqual('heron-bc3')
      expect(variables.printRequest).toBeDefined()
      expect(variables.printRequest.layouts[0]).toEqual(layout)
    })

    it('should produce the correct json if there are multiple barcodes', () => {
      expect(
        Sprint.createPrintRequestBody({
          barcodes: ['DN111111', 'DN222222', 'DN333333']
        }).variables.printRequest.layouts.length
      ).toEqual(3)
    })
  })

  describe('#printLabels', () => {
    let mock, args, barcodes

    afterEach(() => {
      jest.resetAllMocks()
    })

    beforeEach(() => {
      mock = jest.spyOn(axios, 'post')
      args = { numberOfBarcodes: 5, printer: 'heron-bc3' }
      barcodes = [
        'HT-111116',
        'HT-111117',
        'HT-111118',
        'HT-111119',
        'HT-111120'
      ]
    })

    it('successfully', async () => {
      Baracoda.createBarcodes.mockResolvedValue({ success: true, barcodes })
      mock.mockResolvedValue({
        data: {
          print: {
            jobId: 'heron-bc1:eb5a7d75-2510-4355-a3c1-33c1ce8742ba'
          }
        }
      })
      const response = await Sprint.printLabels(args)
      expect(mock).toHaveBeenCalledWith(
        config.privateRuntimeConfig.sprintBaseURL,
        Sprint.createPrintRequestBody({ ...args, barcodes }),
        Sprint.headers
      )
      expect(response.success).toBeTruthy()
      expect(response.message).toEqual(
        'successfully printed 5 labels to heron-bc3'
      )
    })

    it('when baracoda fails', async () => {
      Baracoda.createBarcodes.mockResolvedValue({
        success: false,
        error: errorResponse
      })
      const response = await Sprint.printLabels(args)
      expect(response.success).toBeFalsy()
      expect(response.error).toEqual(errorResponse)
    })

    it('when sprint fails', async () => {
      Baracoda.createBarcodes.mockResolvedValue({ success: true, barcodes })
      mock.mockImplementation(() => rejectPromise())
      const response = await Sprint.printLabels(args)
      expect(response.success).toBeFalsy()
      expect(response.error).toEqual(errorResponse)
    })

    it('when sprint returns an error', async () => {
      Baracoda.createBarcodes.mockResolvedValue({ success: true, barcodes })
      mock.mockResolvedValue({
        data: {
          errors: [
            {
              message:
                'Exception while fetching data (/print) : Unknown printer without explicit printer type: bug'
            }
          ]
        }
      })
      const response = await Sprint.printLabels(args)
      expect(response.success).toBeFalsy()
      expect(response.error).toEqual(
        new Error(
          'Exception while fetching data (/print) : Unknown printer without explicit printer type: bug'
        )
      )
    })
  })
})